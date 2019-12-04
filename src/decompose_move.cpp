#include "gamemove.hpp"
#include "decomposed_move.hpp"
#include "game_utils.hpp"
#include "pathing.hpp"
#include <random>
#include <functional>

void add(MoveAccum & accum,VictoryDecomp instr){
    accum.push_back(DecompMove{.move=DecompType::VICTORY,.info=JoinedDecomp{.victory=instr}});
}
void add(MoveAccum & accum,MoveDecomp instr){
    accum.push_back(DecompMove{.move=DecompType::MOVE,.info=JoinedDecomp{.move=instr}});
}
void add(MoveAccum & accum,DestroyDecomp instr){
    accum.push_back(DecompMove{.move=DecompType::DESTROY_UNIT,.info=JoinedDecomp{.destroy=instr}});
}
void add(MoveAccum & accum,CreateDecomp instr){
    accum.push_back(DecompMove{.move=DecompType::CREATE,.info=JoinedDecomp{.create=instr}});
}
void add(MoveAccum & accum,AddEquipDecomp instr){
    accum.push_back(DecompMove{.move=DecompType::ADD_EQUIPMENT,.info=JoinedDecomp{.equip=instr}});
}
void add(MoveAccum & accum,SetStatusDecomp instr){
    accum.push_back(DecompMove{.move=DecompType::SET_STATUS,.info=JoinedDecomp{.status=instr}});
}
void add(MoveAccum & accum,SetMoneyDecomp instr){
    accum.push_back(DecompMove{.move=DecompType::SET_MONEY,.info=JoinedDecomp{.money=instr}});
}
void add(MoveAccum & accum,SetActivePlayerDecomp instr){
    accum.push_back(DecompMove{.move=DecompType::SET_ACTIVE_PLAYER,.info=JoinedDecomp{.active_player=instr}});
}
void add(MoveAccum & accum,InitGameDecomp instr){
    accum.push_back(DecompMove{.move=DecompType::INIT_GAME_STATE,.info=JoinedDecomp{.init_game=instr}});
}

void decomp_move(MoveAccum & accum,const Game & game,const MoveInfo & instr){
    //do_move(game,instr.start_coord,instr.end_coord);
    UnitStatus new_status = game.map[instr.start_coord].status;
    new_status.moved = true;
    add(accum,SetStatusDecomp{
            .coord=instr.start_coord,
            .new_status=new_status
        });
    add(accum,MoveDecomp{
            .start_coord=instr.start_coord,
            .end_coord=instr.end_coord
        });
}
void decomp_attack(MoveAccum & accum,const Game & game,const AttackInfo & instr){
    Unit source_unit = game.map[instr.source_coord];
    Unit target_unit = game.map[instr.source_coord];
    int source_attack = game.stats.total_stats(source_unit).attack_strength;
    int new_hp = target_unit.status.HP - source_attack;
    if(new_hp <= 0){
        add(accum,DestroyDecomp{.coord=instr.target_coord});
    }
    else{
        UnitStatus new_status = target_unit.status;
        new_status.HP -= source_attack;
        add(accum,SetStatusDecomp{
                .coord=instr.target_coord,
                .new_status=new_status
            });
    }
}
void decomp_build(MoveAccum & accum,const Game & game,const BuildInfo & instr){
    UnitStat stats = game.stats.get(instr.building_type);
    UnitStatus init_status = initial_status(stats);
    Player player = game.players.active_player;
    add(accum,CreateDecomp{
            .coord=instr.coord,
            .unit_type=instr.building_type
        });
    add(accum,SetStatusDecomp{
            .coord=instr.coord,
            .new_status=init_status
        });
    add(accum,SetMoneyDecomp{
            .new_amnt=game.players.get(player).money - stats.cost
        });
}
Player next_player(const Game & game){
    int pnum = static_cast<int>(game.players.active_player);
    int next_num = (pnum + 1) % NUM_PLAYERS;
    return static_cast<Player>(next_num);
}
void reset_status(MoveAccum & accum,UnitStatus & status,const UnitStat & stat){
    status.moved = false;
    status.attacked = false;
    status.buys_left = stat.buys_per_turn;
    status.HP = stat.max_HP;
    if(status.turns_til_active > 0){
        status.turns_til_active -= 1;
    }
}
void all_status_resets(MoveAccum & accum,const Game & game,Player active_player){
    for(Point unit_coord : point_range(game.map.shape())){
        Unit unit = game.map.at(unit_coord);
        if(unit.player == active_player){
            reset_status(accum,unit.status,game.stats.get(unit.unit_type));

            add(accum,SetStatusDecomp{
                    .coord=unit_coord,
                    .new_status=unit.status
                });
        }
    }
}
int get_effective_player_money(const Game & game,Player player){
    int player_assets = get_player_assets(game,player);
    int player_cash = game.players.get(player).money;
    int player_money = player_assets + player_money;

    //if player has no assets, then they are also lost, no matter how much cash
    if(player_assets == 0){
        player_money = 0;
    }
    // is a player is deeply in debt, they also lose the game
    if(player_cash < -500){
        player_money = 0;
    }
    return player_money;
}
Player winning_player(const Game & game){
    int WIN_RATIO = 10;
    int moneyP1 = get_effective_player_money(game,Player::RED);
    int moneyP2 = get_effective_player_money(game,Player::BLUE);

    return moneyP1 >= moneyP2*WIN_RATIO ? Player::RED :
                moneyP2 >= moneyP1*WIN_RATIO ? Player::BLUE :
                    Player::NEITHER_PLAYER;
}
void decomp_end_turn(MoveAccum & accum,const Game & game){
    Player win_player = winning_player(game);
    if(win_player != Player::NEITHER_PLAYER){
        add(accum,VictoryDecomp{win_player});
    }
    else{
        Player player = game.players.active_player;
        int prev_money = game.players.get(player).money;
        int new_money = get_current_income(game,player);
        add(accum,SetMoneyDecomp{
                .new_amnt=prev_money + new_money
            });
        add(accum,SetActivePlayerDecomp{
                .new_active_player=next_player(game)
            });
    }
}
void decomp_buy_unit(MoveAccum & accum,const Game & game,const BuyUnitInfo & instr){
    UnitStat stats = game.stats.get(instr.buy_type);
    UnitStatus init_status = initial_status(stats);
    add(accum,CreateDecomp{
            .coord=instr.placement_coord,
            .unit_type=instr.buy_type
        });
    add(accum,SetStatusDecomp{
            .coord=instr.placement_coord,
            .new_status=init_status
        });
    //set build stats
    UnitStatus new_build_status = game.map.at(instr.building_coord).status;
    new_build_status.buys_left -= 1;

    add(accum,SetStatusDecomp{
            .coord=instr.building_coord,
            .new_status=new_build_status
        });
    Player player = game.players.active_player;
    add(accum,SetMoneyDecomp{
            .new_amnt=game.players.get(player).money - stats.cost
        });
}
void decomp_buy_attachment(MoveAccum & accum,const Game & game,const BuyAttachInfo & instr){
    AttachmentStat stats = game.stats.get(instr.equip_type);
    UnitStatus new_equip_status = game.map.at(instr.equip_coord).status;
    new_equip_status.attacked = true;
    new_equip_status.moved = true;
    add(accum,AddEquipDecomp{
            .coord=instr.equip_coord,
            .equip_type=instr.equip_type
        });
    add(accum,SetStatusDecomp{
            .coord=instr.equip_coord,
            .new_status=new_equip_status
        });

    //set build stats
    UnitStatus new_build_status = game.map.at(instr.building_coord).status;
    new_build_status.buys_left -= 1;

    add(accum,SetStatusDecomp{
            .coord=instr.building_coord,
            .new_status=new_build_status
        });
    Player player = game.players.active_player;
    add(accum,SetMoneyDecomp{
            .new_amnt=game.players.get(player).money - stats.stat_alt.cost
        });
}
void add_init_unit(MoveAccum & accum,const Game & game,UnitType type,Point coord){
    UnitStat stats = game.stats.get(type);
    UnitStatus init_status = initial_status(stats);
    init_status.turns_til_active = 0;
    init_status.attacked = false;
    init_status.moved = false;
    add(accum,CreateDecomp{
            .coord=coord,
            .unit_type=type
        });
    add(accum,SetStatusDecomp{
            .coord=coord,
            .new_status=init_status
        });
}
int rand_dim(int dimsize){
    int border_avoid = 6;
    return rand()%(dimsize-border_avoid*2)+border_avoid;
}
int reflect_dim(int size,int dval){
    return size - dval - 1;
}
Point reflect_over_axes(Point gamesize,Point coord){
    return Point{
        .X=reflect_dim(gamesize.X,coord.X),
        .Y=reflect_dim(gamesize.Y,coord.Y)
    };
}
Point get_init_coord(Point gamesize){
    int min_player_distance = 16;
    Point try_coord;
    do{
        try_coord = Point{rand_dim(gamesize.X),rand_dim(gamesize.Y)};
    }
    while(distance(try_coord,reflect_over_axes(gamesize,try_coord)) < min_player_distance);
    return try_coord;
}
void decomp_init_game(MoveAccum & accum,const Game & game,const InitGameInfo & instr){
    add(accum,InitGameDecomp{.game_size=instr.game_size});
    Point cen = get_init_coord(instr.game_size);
    auto trans = [=](int pnum,Point p){
        return pnum == 1 ? reflect_over_axes(instr.game_size,p) : p;
    };
    //Point cen2 = reflect_over_axes(instr.game_size,cen1);
    for(int p = 0; p < NUM_PLAYERS; p++){
        Player player = static_cast<Player>(p);
        add(accum,SetActivePlayerDecomp{
                .new_active_player=player
            });
        add(accum,SetMoneyDecomp{.new_amnt=instr.initial_money});
        add_init_unit(accum,game,
                      UnitType::BARRACKS,
                      trans(p,cen+Point{-1,0}));
        add_init_unit(accum,game,
                      UnitType::SOLDIER,
                      trans(p,cen+Point{0,-1}));
        add_init_unit(accum,game,
                      UnitType::HOUSE,
                      trans(p,cen+Point{-1,-1}));
        for(Point offset : point_range(Point{0,0},Point{2,3})){
            add_init_unit(accum,game,
                          UnitType::FARM,
                          trans(p,cen+offset));
        }
        for(Point offset : point_range(Point{2,0},Point{3,3})){
            add_init_unit(accum,game,
                          UnitType::VILLAGER,
                          trans(p,cen+offset));
        }
    }
}

void decomp_gamemove(MoveAccum & accum,const Game & game,const GameMove & instr){
    switch(instr.move){
        case MoveType::MOVE: decomp_move(accum,game,instr.info.move); break;
        case MoveType::ATTACK:  decomp_attack(accum,game,instr.info.attack); break;
        case MoveType::BUILD:  decomp_build(accum,game,instr.info.build); break;
        case MoveType::BUY_UNIT:  decomp_buy_unit(accum,game,instr.info.buy_unit); break;
        case MoveType::END_TURN:  decomp_end_turn(accum,game); break;
        case MoveType::BUY_ATTACHMENT:  decomp_buy_attachment(accum,game,instr.info.buy_attach); break;
        case MoveType::GAME_STARTED:  decomp_init_game(accum,game,instr.info.init_game); break;
        default: throw std::runtime_error("bad move type");
    }
}
