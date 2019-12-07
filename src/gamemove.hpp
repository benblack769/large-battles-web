#pragma once
#include "unit.h"
#include "point.hpp"

enum class MoveType{
    MOVE,
    ATTACK,
    BUILD,
    BUY_UNIT,
    END_TURN,
    BUY_ATTACHMENT,
    GAME_STARTED,
    MAX_MOVE_TYPES,//keep this at end so it keep track of how many move types there are
    NULL_MOVE
};
struct MoveInfo{ Point start_coord; Point end_coord; };
struct AttackInfo{ Point source_coord; Point target_coord; };
struct BuildInfo{ Point coord; UnitType building_type;  };
//struct EndTurnInfo{ };
struct BuyUnitInfo{ Point placement_coord; Point building_coord; UnitType buy_type; };
struct BuyAttachInfo{ Point equip_coord; Point building_coord; AttachType equip_type; };
struct InitGameInfo{ Point game_size; Player start_player; int initial_money; };

union JoinedInfo{
    MoveInfo move;
    AttackInfo attack;
    BuildInfo build;
    BuyUnitInfo buy_unit;
    BuyAttachInfo buy_attach;
    InitGameInfo init_game;
};
struct GameMove{
    MoveType move;
    JoinedInfo info;
};
