#include "game_utils.hpp"
#include "decomposed_move.hpp"
#include <cassert>
#include <iostream>

inline Unit create_unit(UnitType unit_ty,Player player){
    Unit u;
    u.player = player;
    u.unit_type = unit_ty;
    return u;
}

void consume_victory(Game & ,const VictoryDecomp & ){
    //noop because this functionality needs to be handled elsewhere
}

void consume_move(Game & game,const MoveDecomp & instr){
    game.map[instr.end_coord].unit = game.map[instr.start_coord].unit;
    game.map[instr.end_coord].category = Category::UNIT;
    game.map[instr.start_coord].category = Category::EMPTY;
}
void consume_destroy(Game & game,const DestroyDecomp & instr){
    game.map[instr.coord].category = Category::EMPTY;
}
void consume_create(Game & game,const CreateDecomp & instr){
    game.map[instr.coord].category = Category::UNIT;
    game.map[instr.coord].unit = create_unit(instr.unit_type,game.players.active_player);
}
void consume_add_equip(Game & game,const AddEquipDecomp & instr){
    SlotType equip_slot = game.stats.get(instr.equip_type).slot;
    game.map[instr.coord].unit.attachments.place(equip_slot,instr.equip_type);
}
void consume_set_status(Game & game,const SetStatusDecomp & instr){
    game.map[instr.coord].unit.status = instr.new_status;
}
void consume_money_change(Game & game,const SetMoneyDecomp & instr){
    game.players.get(game.players.active_player).money = instr.new_amnt;
}
void consume_land_value_change(Game & game,const SetLandValue & instr){
    game.map[instr.coord].value = instr.new_value;
    if(instr.new_value == 0){
        game.map[instr.coord].land = LandType::BARREN;
    }
}
void consume_set_active_player(Game & game,const SetActivePlayerDecomp & instr){
    game.players.active_player = instr.new_active_player;
}
void consume_init_game(Game & game,const InitGameDecomp & instr){
    game.map = Map(instr.game_size);
    for(MapItem & u : game.map.Data){
        u.category = Category::EMPTY;
        u.land = LandType::FERTILE;
        u.value = 50;
    }
}
void consume_decomped(Game & game,const DecompMove & move){
    switch(move.move){
    case DecompType::VICTORY: consume_victory(game,move.info.victory); break;
    case DecompType::MOVE: consume_move(game,move.info.move); break;
    case DecompType::DESTROY_UNIT: consume_destroy(game,move.info.destroy); break;
    case DecompType::CREATE: consume_create(game,move.info.create); break;
    case DecompType::ADD_EQUIPMENT: consume_add_equip(game,move.info.equip); break;
    case DecompType::SET_STATUS: consume_set_status(game,move.info.status); break;
    case DecompType::SET_MONEY: consume_money_change(game,move.info.money); break;
    case DecompType::SET_LAND_VALUE: consume_land_value_change(game,move.info.value); break;
    case DecompType::SET_ACTIVE_PLAYER: consume_set_active_player(game,move.info.active_player); break;
    case DecompType::INIT_GAME_STATE: consume_init_game(game,move.info.init_game); break;
    default: assert(false && "bad decomp move type");
    }
}
