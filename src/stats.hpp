#pragma once
#include <vector>
#include "unit.h"

struct UnitStat{
    int attack_range;
    int move_range;
    int attack_strength;
    int cost;
    int max_HP;
    int upkeep;
    int activation_delay;
    AttachmentList viable_attachments;
    //economic stats
    bool buildable;
    int buys_per_turn;
    bool builder;
    int income;
    AttachmentList can_make_equip;
    UnitList can_make;
    void combine_(const UnitStat & other);
};
struct AttachmentStat{
    SlotType slot;
    UnitStat stat_alt;
};
struct AllStats{
    AllStats();
    std::array<UnitStat,MAX_UNITS> unit_stats;
    std::array<AttachmentStat,MAX_ATTACHMENTS> attachments;
    UnitStat get(UnitType type)const{return unit_stats.at(static_cast<int>(type));}
    AttachmentStat get(AttachType type)const{return attachments.at(static_cast<int>(type));}
    UnitStat total_stats(const Unit & unit)const;
};
UnitStatus initial_status(UnitStat stats);