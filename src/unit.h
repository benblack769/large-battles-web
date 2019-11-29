#pragma once
#include <stdexcept>

enum class Category {UNIT,EMPTY};
enum class Player {RED,BLUE};
enum class UnitType {
    SOLDIER,
    CATAPULT,
    FARM,
    HOUSE,
    BARRACKS,
    CATAPULT_FACTORY,
    ARMORY,
    BA_SHOP,
    SWORD_SHOP,
    PIKE_SHOP,
    STABLE,
    UNIT_TYPES_MAX// keep this at the end, serves to count number of units
};
enum class AttachType{
    ARMOR,
    BOW_AND_ARROW,
    SWORD,
    PIKE,
    HORSE,
    ATTACH_TYPES_MAX// keep this at the end, serves to count number of attachments
};
constexpr size_t MAX_ATTACHMENTS = static_cast<int>(AttachType::ATTACH_TYPES_MAX);
inline AttachType attach_of(int x){
    if(x < 0 || x >= MAX_ATTACHMENTS){
        throw std::runtime_error("bad attachment found");
    }
    return static_cast<AttachType>(x);
}
struct AttachmentList{
    bool attachList[MAX_ATTACHMENTS] = {false};
    bool in(AttachType att){
        return attachList[static_cast<int>(att)];
    }
};

struct UnitStatus{
    bool moved=true;
    bool attacked=true;
    int HP=0;
    int buys_left=0;
    int turns_til_active=0;
};
struct Unit{
    Category category;
    Player player;
    UnitType unit_type;
    UnitStatus status;
};
inline Unit create_empty(){
    Unit u;
    u.category = Category::EMPTY;
    return u;
}