#pragma once
#include "game_utils.hpp"

using MoveList = std::vector<GameMove>;
MoveList find_moves(const Game & game,Player player);
