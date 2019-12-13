#pragma once
#include "game_utils.hpp"

using MoveList = std::vector<GameMove>;
MoveList random_moves(const Game & game);
MoveList genetic_movefinding(const Game & game);
