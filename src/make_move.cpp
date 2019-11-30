#include "gamemove.hpp"
#include "game.hpp"

void do_move(Game & game,Point start,Point end){
    game.map[end] = game.map[start];
    game.map[start] = create_empty();
}
void do_create(Game & game,const MoveInfo & instr){

}
void do_money_change(Game & game,const MoveInfo & instr){

}
void do_set_active_player(Game & game,const MoveInfo & instr){

}
void do_add_equip(Game & game,const MoveInfo & instr){

}
void do_destroy_unit(Game & game,Point coord){
    game.map[coord] = create_empty();
}

void make_move(Game & game,MoveInfo & instr){
    do_move(game,instr.start_coord,instr.end_coord);
    game.map[instr.end_coord].status.moved = true;
}
void make_attack(Game & game,AttackInfo & instr,Player player){
    Unit & source_unit = game.map[instr.source_coord];
    Unit & target_unit = game.map[instr.source_coord];
    int source_attack = game.stats.total_stats(source_unit).attack_strength;
    int new_hp = target_unit.status.HP - source_attack;
    if(new_hp <= 0){
        do_destroy_unit(game,instr.source_coord);
    }
    else{
        target_unit.status.HP = new_hp;
    }
}
void make_build(Game & game,BuildInfo & instr,Player player){
    UnitStat stats = game.stats.get(instr.building_type);
    game.map[instr.coord] = create_new_unit(stats);
    game.map[instr.coord].status.turns_til_active = stats.activation_delay;
    game.players.get(player).money -= stats.cost;
}
Player next_player(Game & game){
    int pnum = static_cast<int>(game.players.active_player);
    int next_num = (pnum + 1) % NUM_PLAYERS;
    return static_cast<Player>(next_num);
}
void reset_status(UnitStatus & status,const UnitStat & stat){
    status.moved = false;
    status.attacked = false;
    status.buys_left = stat.buys_per_turn;
    status.HP = stat.max_HP;
    if(status.turns_til_active > 0){
        status.turns_til_active -= 1;
    }
}
void all_status_resets(Game & game,Player active_player){
    for(Unit & unit : game.map.Data){
        if(unit.player == active_player){
            reset_status(unit.status,game.stats.get(unit.unit_type));
        }
    }
}
int get_player_assets(){
    
}
Player winning_player(Game & game){
    int WIN_RATIO = 10;
    for(Player player : {Player::RED,Player::BLUE}){
        int player_asserts = 
    }
}