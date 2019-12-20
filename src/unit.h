#pragma once
#include <array>
#include <cassert>
#include "RangeIterator.h"

enum class Category {UNIT,EMPTY};
enum class LandType {
    FERTILE,
    BARREN,
    LAND_TYPES_MAX// keep this at the end, serves to count number of land types
};
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
inline auto all_land_types(){ return enum_range(LandType::LAND_TYPES_MAX);}

constexpr size_t MAX_ATTACHMENTS = static_cast<int>(AttachType::ATTACH_TYPES_MAX);
constexpr size_t MAX_UNITS = static_cast<int>(UnitType::UNIT_TYPES_MAX);
constexpr size_t MAX_SLOTS = static_cast<int>(SlotType::SLOT_TYPES_MAX);
constexpr size_t MAX_LAND_TYPES = static_cast<int>(LandType::LAND_TYPES_MAX);
inline AttachType attach_of(size_t x){
    assert(x >= MAX_ATTACHMENTS && "bad attachment found");
    return static_cast<AttachType>(x);
}
template<class ElTy,size_t MAX_SIZE>
struct FixedElementList{
    std::array<bool,MAX_SIZE> elList;
    FixedElementList(){
        elList.fill(false);
    }
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
template<typename EnumTy,typename DataTy,size_t MAX_ENUMS>
struct EnumArray{
    std::array<DataTy,MAX_ENUMS> data;
    EnumArray(){
        data.fill(DataTy{});
    };
    EnumArray(DataTy default_value){
        data.fill(default_value);
    }
    const DataTy & at(EnumTy enum_v)const{
        return data.at(static_cast<int>(enum_v));
    }
    DataTy & at(EnumTy enum_v){
        return data.at(static_cast<int>(enum_v));
    }
    const DataTy & operator[](EnumTy enum_v)const{
        return at(enum_v);
    }
    DataTy & operator[](EnumTy enum_v){
        return at(enum_v);
    }
};
template<class DataTy>
using AttachArray = EnumArray<AttachType,DataTy,MAX_ATTACHMENTS>;
template<class DataTy>
using UnitArray = EnumArray<UnitType,DataTy,MAX_UNITS>;
template<class DataTy>
using LandArray = EnumArray<LandType,DataTy,MAX_LAND_TYPES>;

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
    int16_t turns_til_active;
    int16_t HP;
    int16_t buys_left;
    bool moved;
    bool attacked;
};
struct Unit{
    Player player;
    UnitType unit_type;
    UnitStatus status;
    Slots attachments;
};
struct MapItem{
    Category category;
    LandType land;
    int value;
    Unit unit;
};
