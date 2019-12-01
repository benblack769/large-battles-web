#include "game.hpp"

int get_player_assets(const Game & game,Player player);
int get_current_income(const Game & game,Player player);

using MoveAccum = std::vector<DecompMove>;
bool validate(std::string & errmsg,const Game & game,const GameMove & move, Player player);
void decomp_gamemove(MoveAccum & accum, const Game & game, const GameMove & instr);
void consume_decomped(Game & game,const DecompMove & move);
