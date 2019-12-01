#include "game_utils.hpp"
#include "decomposed_move.hpp"

void consume_victory(Game & game,const VictoryDecomp & instr){
    //noop because this functionality needs to be handled elsewhere
}

void consume_move(Game & game,const MoveDecomp & instr){
    game.map[instr.end_coord] = game.map[instr.start_coord];
    game.map[instr.start_coord] = create_empty();
}
void consume_destroy(Game & game,const DestroyDecomp & instr){
    game.map[instr.coord] = create_empty();
}
void consume_create(Game & game,const CreateDecomp & instr){
    game.map[instr.coord] = create_unit(instr.unit_type,game.players.active_player);
}
void consume_add_equip(Game & game,const AddEquipDecomp & instr){
    game.map[instr.coord].attachments.add(instr.equip_type);
}
void consume_set_status(Game & game,const SetStatusDecomp & instr){
    game.map[instr.coord].status = instr.new_status;
}
void consume_money_change(Game & game,const SetMoneyDecomp & instr){
    game.players.get(game.players.active_player).money = instr.new_amnt;
}
void consume_set_active_player(Game & game,const SetActivePlayerDecomp & instr){
    game.players.active_player = instr.new_active_player;
}
void consume_init_game(Game & game,const InitGameDecomp & instr){
    game.map = DArray2d(instr.game_size.X,instr.game_size.Y);
}
void consume_decomped(Game & game,const DecompMove & move){
    switch(move.move){
        case DecompType::VICTORY: consume_victory(game,move.info.victory); break;
    }
}


