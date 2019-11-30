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
};
enum class AttachmentSlot{TOP_RIGHT,TOP_LEFT,BOTTOM_RIGHT,BOTTOM_LEFT};
struct AttachmentStat{
    int cost;
    AttachmentSlot slot;
    UnitStat stat_alt;
};
struct AllStats{
    AllStats();
    std::vector<UnitStat> unit_stats;
    std::vector<AttachmentStat> attachments;
    UnitStat get(UnitType type)const{return unit_stats.at(static_cast<int>(type));}
    AttachmentStat get(AttachType type)const{return attachments.at(static_cast<int>(type));}
    UnitStat total_stats(const Unit & unit)const;
};
