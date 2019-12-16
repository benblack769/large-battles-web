#include "game_utils.hpp"
#include "pathing.hpp"
#include <iostream>

struct validate_error{
    const char * info;
    validate_error(const char * value){
        info = value;
    }
    validate_error(){
        info = nullptr;
    }
     operator bool(){
        return info != nullptr;
    }
    const char * what()const{
        return info;
    }
};
validate_error valid(){
    return validate_error();
}
//#def assert_ret(expr,msg) {if(expr){return validate_error(msg);}}
#define ret_if(expr) {auto val = (expr); if(val){return val;}}
validate_error assert_valid_coord(const Map & map,Point coord){
    if(!map.in_bounds(coord)){
        return validate_error("Targeted player other than self");
    }
    return valid();
}
validate_error assert_empty(const Map & map, Point coord){
    ret_if(assert_valid_coord(map,coord));
    if(map[coord].category != Category::EMPTY){
        return validate_error("Coordinate should be empty, was not");
    }
    return valid();
}
validate_error assert_player_is(const Map & map, Point coord, Player player){
    if(!is_player(map[coord],player)){
        return validate_error("Targeted player other than self");
    }
    return valid();
}
validate_error assert_player_is_not(const Map & map, Point coord, Player player){
    if(is_player(map[coord],player)){
        return validate_error("Cannot attack yourself");
    }
    return valid();
}
validate_error assert_actual_move(Point start,Point end){
    if(start == end){
        return validate_error("zero position moves invalid");
    }
    return valid();
}
validate_error assert_actual_attack(Point start,Point end){
    if(start == end){
        return validate_error("units cannot attack themselves");
    }
    return valid();
}
validate_error assert_is_unit(const Map & map, Point coord){
    ret_if(assert_valid_coord(map,coord));
    if(map[coord].category != Category::UNIT){
        return validate_error("Coordinate should be unit, was not");
    }
    return valid();
}
validate_error assert_hasnt_moved(const Unit & unit){
    if(unit.status.moved){
        return validate_error("tried to move unit twice in a single turn");
    }
    return valid();
}

validate_error assert_in_range(const Map & map,Point start_coord,Point end_coord,int range){
    //bool is_possible_move(const Map & map,Point start,Point end,int range){
    if(distance(start_coord,end_coord) > range){
        return validate_error("Square out of range, distance too great.");
    }
    if(!(is_possible_move(map,start_coord,end_coord,range))){
        return validate_error("square out of range, blocked by unit.");
    }
    return valid();
}
validate_error assert_movement_range(const Game & game,const MoveInfo & instr,const Unit & unit){
    int range = game.stats.total_stats(unit).move_range;
    ret_if(assert_in_range(game.map,instr.start_coord,instr.end_coord,range));
    return valid();
}
validate_error assert_active_player(const Game & game,Player player){
    if(game.players.active_player != player){
        return validate_error("You are not the active player and so you can make no moves.");
    }
    return valid();
}
validate_error assert_unit_active(const Map & map,Point coord){
    int num_active_turns = map[coord].status.turns_til_active;
    if(num_active_turns > 0){
        return validate_error("Unit needs more turns until active");
    }
    return valid();
}
validate_error assert_active_unit(const Game & game,Point coord,Player player){
    ret_if(assert_valid_coord(game.map,coord));
    ret_if(assert_is_unit(game.map,coord));
    ret_if(assert_unit_active(game.map,coord));
    ret_if(assert_player_is(game.map,coord,player));
    ret_if(assert_active_player(game,player));
    return valid();
}
validate_error valid_move(const Game & game,const MoveInfo & instr,Player player){
    ret_if(assert_empty(game.map,instr.end_coord));
    ret_if(assert_active_unit(game,instr.start_coord,player));
    ret_if(assert_actual_move(instr.start_coord,instr.end_coord));
    Unit unit = game.map[instr.start_coord];
    assert(player == unit.player);
    ret_if(assert_hasnt_moved(unit));
    ret_if(assert_movement_range(game,instr,unit));
    return valid();
}
validate_error assert_hasnt_attacked(const Unit & unit){
    if(unit.status.attacked){
        return validate_error("tried to use unit to attack twice in a single turn");
    }
    return valid();
}
validate_error assert_is_possible_attack(const Game & game,const AttackInfo & instr,const Unit & unit){
    int range = game.stats.total_stats(unit).attack_range;
    if(!is_possible_attack(game.map,instr.source_coord,instr.target_coord,range)){
        return validate_error("Cannot attack target. Remember that attacks can only occur in strait lines and that attacking through a unit is not possible.");
    }
    return valid();
}
validate_error valid_attack(const Game & game,const AttackInfo & instr,Player player){
    ret_if(assert_active_unit(game,instr.source_coord,player));
    ret_if(assert_is_unit(game.map,instr.target_coord));
    ret_if(assert_player_is_not(game.map,instr.target_coord,player));
    ret_if(assert_actual_attack(instr.source_coord,instr.target_coord));
    Unit unit = game.map[instr.source_coord];
    ret_if(assert_hasnt_attacked(unit));
    ret_if(assert_is_possible_attack(game,instr,unit));
    return valid();
}
int get_money(const Game & game,Player player){
    return game.players.get(player).money;
}
validate_error assert_money_enough(const Game & game,Player player,UnitType build_type){
    if(game.stats.get(build_type).cost > get_money(game,player)){
        return validate_error("Building costs more money than you have!");
    }
    return valid();
}
validate_error assert_money_enough_equip(const Game & game,Player player,AttachType equip_type){
    if(game.stats.get(equip_type).stat_alt.cost > get_money(game,player)){
        return validate_error("Equipment costs more money than you have!");
    }
    return valid();
}
validate_error assert_buildable(const Game & game,UnitType build_type){
    if(!game.stats.get(build_type).buildable){
        return validate_error("Unit type not buildable!");
    }
    return valid();
}

validate_error assert_builder(const Game & game,Point coord){
    Unit unit = game.map[coord];
    if(!game.stats.get(unit.unit_type).builder){
        return validate_error("annot build over a unit that is not a builder!");
    }
    return valid();
}

validate_error valid_build(const Game & game,const BuildInfo & instr,Player player){
    //assert_valid_unit_type(game,instr.building_type);
    ret_if(assert_active_player(game,player));
    ret_if(assert_active_unit(game, instr.coord, player));
    ret_if(assert_builder(game, instr.coord));
    ret_if(assert_buildable(game,instr.building_type));
    ret_if(assert_money_enough(game, player,instr.building_type));
    return valid();
}
validate_error valid_end_turn(const Game & game,Player player){
    ret_if(assert_active_player(game,player));
    return valid();
}
validate_error assert_building_can_build(const Game & game,const BuyUnitInfo & instr){
    Unit building = game.map[instr.building_coord];
    UnitStat building_stats = game.stats.get(building.unit_type);
    if(!building_stats.can_make.includes(instr.buy_type)){
        return validate_error("Selected building cannot make unit of selected type");
    }
    if(!building.status.buys_left){
        return validate_error("Building cannot buy any more units this turn. Wait until next turn.");
    }
    return valid();
}
validate_error valid_buy_unit(const Game & game,const BuyUnitInfo & instr,Player player){
    ret_if(assert_empty(game.map, instr.placement_coord));
    ret_if(assert_active_unit(game, instr.building_coord, player));
    ret_if(assert_money_enough(game, player, instr.buy_type));
    ret_if(assert_building_can_build(game,instr));
    int BUY_RANGE = 1;
    ret_if(assert_in_range(game.map, instr.building_coord, instr.placement_coord, BUY_RANGE));
    return valid();
}
validate_error assert_building_can_equip(const Game & game,const BuyAttachInfo & instr){
    Unit building = game.map[instr.building_coord];
    UnitStat building_stats = game.stats.get(building.unit_type);
    if(!building_stats.can_make_equip.includes(instr.equip_type)){
        return validate_error("Selected building cannot make unit of selected type");
    }
    if(!building.status.buys_left){
        return validate_error("Building cannot buy any more units this turn. Wait until next turn.");
    }
    return valid();
}
validate_error assert_target_can_be_equipped(const Game & game,const BuyAttachInfo & instr){
    Unit target = game.map[instr.equip_coord];
    UnitStat target_stats = game.stats.get(target.unit_type);
    if(!target_stats.viable_attachments.includes(instr.equip_type)){
        return validate_error("Target unit cannot equip equipment of selected type");
    }
    SlotType slot = game.stats.get(instr.equip_type).slot;
    if(target.attachments.slot_filled(slot)){
        return validate_error("Attachment slot for this unit is already full!.");
    }
    return valid();
}
validate_error valid_buy_attachment(const Game & game,const BuyAttachInfo & instr,Player player){
    ret_if(assert_active_unit(game, instr.equip_coord, player));
    ret_if(assert_active_unit(game, instr.building_coord, player));
    ret_if(assert_money_enough_equip(game, player, instr.equip_type));
    ret_if(assert_building_can_equip(game,instr));
    ret_if(assert_target_can_be_equipped(game,instr));
    int BUY_RANGE = 1;
    ret_if(assert_in_range(game.map, instr.building_coord, instr.equip_coord, BUY_RANGE));
    return valid();
}
validate_error validate_game_start(const Game & ,const InitGameInfo & ,Player player){
    if(player != Player::SERVER_PLAYER){
        return validate_error("Only server player can issue this special instruction: game_start.");
    }
    return valid();
}
validate_error valid_gamemove(const Game & game,const GameMove & instr,Player player){
    switch(instr.move){
        case MoveType::MOVE: return valid_move(game,instr.info.move,player);
        case MoveType::ATTACK: return valid_attack(game,instr.info.attack,player);
        case MoveType::BUILD: return valid_build(game,instr.info.build,player);
        case MoveType::BUY_UNIT: return valid_buy_unit(game,instr.info.buy_unit,player);
        case MoveType::END_TURN: return valid_end_turn(game,player);
        case MoveType::BUY_ATTACHMENT: return valid_buy_attachment(game,instr.info.buy_attach,player);
        case MoveType::GAME_STARTED: return validate_game_start(game,instr.info.init_game,player);
        default: return validate_error("bad move type");
    }
}
bool validate(const char *& errmsg,const Game & game,const GameMove & move, Player player){
    validate_error err = valid_gamemove(game,move,player);
    if(err){
        errmsg = err.what();
        return false;
    }
    else{
        errmsg = "";
        return true;
    }
}
bool is_valid(const Game & game,const GameMove & move, Player player){
    const char * a;
    return validate(a,game,move,player);
}
