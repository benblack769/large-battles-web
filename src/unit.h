#pragma once
#include <stdexcept>
#include <array>
#include "RangeIterator.h"

enum class Category {UNIT,EMPTY};
enum class Player {RED,BLUE,NEITHER_PLAYER,SERVER_PLAYER};
enum class UnitType {
    SOLDIER,
    CATAPULT,
    FARM,
    HOUSE,
    VILLAGER,
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
    ATTACH_TYPES_MAX,// keep this at the end, serves to count number of attachments
    NULL_ATTACHMENT
};
enum class SlotType{
    TOP_RIGHT,
    TOP_LEFT,
    BOTTOM_RIGHT,
    BOTTOM_LEFT,
    SLOT_TYPES_MAX // keep this at the end, serves to count number of slots 
};
inline auto all_slots(){ return enum_range(SlotType::SLOT_TYPES_MAX);}
inline auto all_attachs(){ return enum_range(AttachType::ATTACH_TYPES_MAX);}
inline auto all_units(){ return enum_range(UnitType::UNIT_TYPES_MAX);}

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
    void add(ElTy el){
        elList.at(static_cast<int>(el)) = true;
    }
    void union_(const FixedElementList & other){
        for(size_t i = 0; i < MAX_SIZE; i++){
            elList[i] |= other.elList[i];
        }
    }
};
using AttachmentList = FixedElementList<AttachType,MAX_ATTACHMENTS>;
using UnitList = FixedElementList<UnitType,MAX_UNITS>;
struct Slots{
    std::array<AttachType,MAX_SLOTS> data;
    Slots(){
        data.fill(AttachType::NULL_ATTACHMENT);
    }
    bool slot_filled(SlotType slot)const{
        return this->at(slot) != AttachType::NULL_ATTACHMENT;
    }
    AttachType at(SlotType slot)const{
        return data.at(static_cast<int>(slot));
    }
    void place(SlotType slot,AttachType attach){
        data.at(static_cast<int>(slot)) = attach;
    }
};
//using SlotList = FixedElementList<SlotType,MAX_SLOTS>;

struct UnitStatus{
    int turns_til_active=0;
    int HP=0;
    int buys_left=0;
    bool moved=true;
    bool attacked=true;
};
struct Unit{
    Category category;
    Player player;
    UnitType unit_type;
    UnitStatus status;
    Slots attachments;
};
inline Unit create_unit(UnitType unit_ty,Player player){
    Unit u;
    u.category = Category::UNIT;
    u.player = player;
    u.unit_type = unit_ty;
    return u;
}
inline Unit create_empty(){
    Unit u;
    u.category = Category::EMPTY;
    return u;
}
