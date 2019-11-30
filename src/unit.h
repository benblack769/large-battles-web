#pragma once
#include <stdexcept>
#include <array>

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
enum class SlotType{
    TOP_RIGHT,
    TOP_LEFT,
    BOTTOM_RIGHT,
    BOTTOM_LEFT,
    SLOT_TYPES_MAX // keep this at the end, serves to count number of slots 
};

constexpr size_t MAX_ATTACHMENTS = static_cast<int>(AttachType::ATTACH_TYPES_MAX);
constexpr size_t MAX_UNITS = static_cast<int>(UnitType::UNIT_TYPES_MAX);
constexpr size_t MAX_SLOTS = static_cast<int>(SlotType::SLOT_TYPES_MAX);
inline AttachType attach_of(int x){
    if(x < 0 || x >= MAX_ATTACHMENTS){
        throw std::runtime_error("bad attachment found");
    }
    return static_cast<AttachType>(x);
}
template<class ElTy,size_t MAX_SIZE>
struct FixedElementList{
    std::array<bool,MAX_SIZE> elList;
    bool includes(ElTy el)const{
        return elList.at(static_cast<int>(el));
    }
};
using AttachmentList = FixedElementList<AttachType,MAX_ATTACHMENTS>;
using UnitList = FixedElementList<UnitType,MAX_UNITS>;
using SlotList = FixedElementList<SlotType,MAX_SLOTS>;

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
    SlotList attachments;
};
inline Unit create_empty(){
    Unit u;
    u.category = Category::EMPTY;
    return u;
}