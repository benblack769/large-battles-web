#include "game_utils.hpp"
#include "pathing.hpp"

struct validate_error{
    const char * info;
    validate_error(const char * value){
        info = value;
    }
    const char * what()const{
        return info;
    }
};
void assert_valid_coord(const Map & map,Point coord){
    if(!map.in_bounds(coord)){
        throw validate_error("Targeted player other than self");
    }
}
void assert_empty(const Map & map, Point coord){
    assert_valid_coord(map,coord);
    if(map[coord].category != Category::EMPTY){
        throw validate_error("Coordinate should be empty, was not");
    }
}
void assert_player_is(const Map & map, Point coord, Player player){
    if(map[coord].player != player){
        throw validate_error("Targeted player other than self");
    }
}
void assert_player_is_not(const Map & map, Point coord, Player player){
    if(map[coord].player == player){
        throw validate_error("Cannot attack yourself");
    }
}
void assert_actual_move(Point start,Point end){
    if(start != end){
        throw validate_error("zero position moves invalid");
    }
}
void assert_actual_attack(Point start,Point end){
    if(start != end){
        throw validate_error("units cannot attack themselves");
    }
}
void assert_is_unit(const Map & map, Point coord){
    assert_valid_coord(map,coord);
    if(map[coord].category != Category::UNIT){
        throw validate_error("Coordinate should be unit, was not");
    }
}
void assert_hasnt_moved(const Unit & unit){
    if(unit.status.moved){
        throw validate_error("tried to move unit twice in a single turn");
    }
}

void assert_in_range(const Map & map,Point start_coord,Point end_coord,int range){
    //bool is_possible_move(const Map & map,Point start,Point end,int range){
    if(distance(start_coord,end_coord) > range){
        throw validate_error("Square out of range, distance too great.");
    }
    if(!(is_possible_move(map,start_coord,end_coord,range))){
        throw validate_error("square out of range, blocked by unit.");
    }
}
void assert_movement_range(const Game & game,const MoveInfo & instr,const Unit & unit){
    int range = game.stats.total_stats(unit).move_range;
    assert_in_range(game.map,instr.start_coord,instr.end_coord,range);
}
void assert_active_player(const Game & game,Player player){
    if(game.players.active_player != player){
        throw validate_error("You are not the active player and so you can make no moves.");
    }
}
void assert_unit_active(const Map & map,Point coord){
    int num_active_turns = map[coord].status.turns_til_active;
    if(num_active_turns > 0){
        throw validate_error("Unit needs more turns until active");
    }
}
void assert_active_unit(const Game & game,Point coord,Player player){
    assert_valid_coord(game.map,coord);
    assert_is_unit(game.map,coord);
    assert_unit_active(game.map,coord);
    assert_player_is(game.map,coord,player);
    assert_active_player(game,player);
}
void valid_move(const Game & game,const MoveInfo & instr,Player player){
    assert_empty(game.map,instr.end_coord);
    assert_active_unit(game,instr.start_coord,player);
    assert_actual_move(instr.start_coord,instr.end_coord);
    Unit unit = game.map[instr.start_coord];
    assert_hasnt_moved(unit);
    assert_movement_range(game,instr,unit);
}
void assert_hasnt_attacked(const Unit & unit){
    if(unit.status.attacked){
        throw validate_error("tried to use unit to attack twice in a single turn");
    }
}
void assert_is_possible_attack(const Game & game,const AttackInfo & instr,const Unit & unit){
    int range = game.stats.total_stats(unit).attack_range;
    if(!is_possible_attack(game.map,instr.source_coord,instr.target_coord,range)){
        throw validate_error("Cannot attack target. Remember that attacks can only occur in strait lines and that attacking through a unit is not possible.");
    }
}
void valid_attack(const Game & game,const AttackInfo & instr,Player player){
    assert_active_unit(game,instr.source_coord,player);
    assert_is_unit(game.map,instr.target_coord);
    assert_player_is_not(game.map,instr.target_coord,player);
    assert_actual_attack(instr.source_coord,instr.target_coord);
    Unit unit = game.map[instr.source_coord];
    assert_hasnt_attacked(unit);
    assert_is_possible_attack(game,instr,unit);
}
int get_money(const Game & game,Player player){
    return game.players.get(player).money;
}
void assert_money_enough(const Game & game,Player player,UnitType build_type){
    if(game.stats.get(build_type).cost > get_money(game,player)){
        throw validate_error("Building costs more money than you have!");
    }
}
void assert_money_enough_equip(const Game & game,Player player,AttachType equip_type){
    if(game.stats.get(equip_type).stat_alt.cost > get_money(game,player)){
        throw validate_error("Equipment costs more money than you have!");
    }
}
void assert_buildable(const Game & game,UnitType build_type){
    if(!game.stats.get(build_type).buildable){
        throw validate_error("Unit type not buildable!");
    }
}

void assert_builder(const Game & game,Point coord){
    Unit unit = game.map[coord];
    if(!game.stats.get(unit.unit_type).builder){
        throw validate_error("annot build over a unit that is not a builder!");
    }
}

void valid_build(const Game & game,const BuildInfo & instr,Player player){
    //assert_valid_unit_type(game,instr.building_type);
    assert_active_player(game,player);
    assert_active_unit(game, instr.coord, player);
    assert_builder(game, instr.coord);
    assert_buildable(game,instr.building_type);
    assert_money_enough(game, player,instr.building_type);
}
void valid_end_turn(const Game & game,Player player){
    assert_active_player(game,player);
}
void assert_building_can_build(const Game & game,const BuyUnitInfo & instr){
    Unit building = game.map[instr.building_coord];
    UnitStat building_stats = game.stats.get(building.unit_type);
    if(!building_stats.can_make.includes(instr.buy_type)){
        throw validate_error("Selected building cannot make unit of selected type");
    }
    if(!building.status.buys_left){
        throw validate_error("Building cannot buy any more units this turn. Wait until next turn.");
    }
}
void valid_buy_unit(const Game & game,const BuyUnitInfo & instr,Player player){
    assert_empty(game.map, instr.placement_coord);
    assert_active_unit(game, instr.building_coord, player);
    assert_money_enough(game, player, instr.buy_type);
    assert_building_can_build(game,instr);
    int BUY_RANGE = 1;
    assert_in_range(game.map, instr.building_coord, instr.placement_coord, BUY_RANGE);
}
void assert_building_can_equip(const Game & game,const BuyAttachInfo & instr){
    Unit building = game.map[instr.building_coord];
    UnitStat building_stats = game.stats.get(building.unit_type);
    if(!building_stats.can_make_equip.includes(instr.equip_type)){
        throw validate_error("Selected building cannot make unit of selected type");
    }
    if(!building.status.buys_left){
        throw validate_error("Building cannot buy any more units this turn. Wait until next turn.");
    }
}
void assert_target_can_be_equipped(const Game & game,const BuyAttachInfo & instr){
    Unit target = game.map[instr.equip_coord];
    UnitStat target_stats = game.stats.get(target.unit_type);
    if(!target_stats.viable_attachments.includes(instr.equip_type)){
        throw validate_error("Target unit cannot equip equipment of selected type");
    }
    SlotType slot = game.stats.get(instr.equip_type).slot;
    if(!game.map[instr.equip_coord].attachments.slot_filled(slot)){
        throw validate_error("Building cannot buy any more units this turn. Wait until next turn.");
    }
}
void valid_buy_attachment(const Game & game,const BuyAttachInfo & instr,Player player){
    assert_active_unit(game, instr.equip_coord, player);
    assert_active_unit(game, instr.building_coord, player);
    assert_money_enough_equip(game, player, instr.equip_type);
    assert_building_can_equip(game,instr);
    assert_target_can_be_equipped(game,instr);
    int BUY_RANGE = 1;
    assert_in_range(game.map, instr.building_coord, instr.equip_coord, BUY_RANGE);
}
void validate_game_start(const Game & ,const InitGameInfo & ,Player player){
    if(player != Player::SERVER_PLAYER){
        throw validate_error("Only server player can issue this special instruction: game_start.");
    }
}
void valid_gamemove(const Game & game,const GameMove & instr,Player player){
    switch(instr.move){
        case MoveType::MOVE: valid_move(game,instr.info.move,player); break;
        case MoveType::ATTACK:  valid_attack(game,instr.info.attack,player); break;
        case MoveType::BUILD:  valid_build(game,instr.info.build,player); break;
        case MoveType::BUY_UNIT:  valid_buy_unit(game,instr.info.buy_unit,player); break;
        case MoveType::END_TURN:  valid_end_turn(game,player); break;
        case MoveType::BUY_ATTACHMENT:  valid_buy_attachment(game,instr.info.buy_attach,player); break;
        case MoveType::GAME_STARTED:  validate_game_start(game,instr.info.init_game,player); break;
        default: throw validate_error("bad move type");
    }
}
bool validate(const char *& errmsg,const Game & game,const GameMove & move, Player player){
    try{
        valid_gamemove(game,move,player);
    }
    catch(validate_error err){
        errmsg = err.what();
        return false;
    }
    errmsg = "";
    return true;
}
bool is_valid(const Game & game,const GameMove & move, Player player){
    const char * a;
    return validate(a,game,move,player);
}
