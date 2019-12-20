#pragma once
#include "unit.h"
#include "point.hpp"

enum class DecompType{
    VICTORY,
    MOVE,
    DESTROY_UNIT,
    CREATE,
    ADD_EQUIPMENT,
    SET_STATUS,
    SET_MONEY,
    SET_LAND_VALUE,
    SET_ACTIVE_PLAYER,
    INIT_GAME_STATE
};
struct VictoryDecomp{ Player winner; };
struct MoveDecomp{ Point start_coord; Point end_coord; };
struct DestroyDecomp{ Point coord; };
struct CreateDecomp{ Point coord; UnitType unit_type;  };
struct AddEquipDecomp{ Point coord; AttachType equip_type;  };
struct SetStatusDecomp{ Point coord; UnitStatus new_status;  };
struct SetMoneyDecomp{  int new_amnt;  };
struct SetLandValue{  Point coord; int new_value;  };
struct SetActivePlayerDecomp{ Player new_active_player;  };
struct InitGameDecomp{ Point game_size; };
//struct EndTurnInfo{ };

union JoinedDecomp{
    VictoryDecomp victory;
    MoveDecomp move;
    DestroyDecomp destroy;
    CreateDecomp create;
    AddEquipDecomp equip;
    SetStatusDecomp status;
    SetMoneyDecomp money;
    SetLandValue value;
    SetActivePlayerDecomp active_player;
    InitGameDecomp init_game;
};
struct DecompMove{
    DecompType move;
    JoinedDecomp info;
};
