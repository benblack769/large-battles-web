#include "stats.hpp"
UnitStat AllStats::total_stats(const Unit & unit)const{
    UnitStat stats = this->get(unit.unit_type);
    for(SlotType slot : all_slots()){
        if(unit.attachments.slot_filled(slot)){
            stats.combine_(this->get(unit.attachments.at(slot)).stat_alt);
        }
    }
    return stats;
}
void UnitStat::combine_(const UnitStat & other){
    this->attack_range += other.attack_range;
    this->move_range += other.move_range;
    this->attack_strength += other.attack_strength;
    this->cost += other.cost;
    this->max_HP += other.max_HP;
    this->upkeep += other.upkeep;
    this->activation_delay += other.activation_delay;
    this->viable_attachments.union_(other.viable_attachments);

    this->buildable |= other.buildable;
    this->buys_per_turn += other.buys_per_turn;
    this->builder |= other.builder;
    this->income += other.income;
    this->can_make_equip.union_(other.can_make_equip);
    this->can_make.union_(other.can_make);
}
UnitStat zero_stat(){
    UnitStat u;
    u.attack_range=0;
    u.move_range=0;
    u.attack_strength=0;
    u.cost=0;
    u.max_HP=0;
    u.upkeep=0;
    u.activation_delay=0;
    u.buildable=false;
    u.buys_per_turn=0;
    u.builder=false;
    u.income=0;
    u.viable_attachments=AttachmentList();
    u.can_make_equip=AttachmentList();
    u.can_make=UnitList();
    return u;
}
AllStats::AllStats(){

    //fill stats with default values
    this->unit_stats.fill(zero_stat());
    for(auto & astat : this->attachments){
        astat.stat_alt = zero_stat();
    }


    // fill unit stats
    UnitStat & soldier = this->unit_stats.at(static_cast<int>(UnitType::SOLDIER));
    soldier.attack_range = 1;
    soldier.move_range = 2;
    soldier.attack_strength = 1;
    soldier.cost = 20;
    soldier.max_HP = 2;
    soldier.upkeep = 5;
    soldier.activation_delay = 3;
    soldier.viable_attachments.add(AttachType::ARMOR);
    soldier.viable_attachments.add(AttachType::PIKE);
    soldier.viable_attachments.add(AttachType::SWORD);
    soldier.viable_attachments.add(AttachType::HORSE);

    UnitStat & catapult = this->unit_stats.at(static_cast<int>(UnitType::CATAPULT));
    catapult.attack_range = 3;
    catapult.move_range = 1;
    catapult.attack_strength = 4;
    catapult.cost = 100;
    catapult.max_HP = 2;
    catapult.upkeep = 20;
    catapult.activation_delay = 5;
    catapult.viable_attachments.add(AttachType::HORSE);

    UnitStat & villager = this->unit_stats.at(static_cast<int>(UnitType::VILLAGER));
    villager.attack_range = 0;
    villager.move_range = 1;
    villager.cost = 10;
    villager.upkeep = 2;
    villager.activation_delay = 2;
    villager.builder = true;

    UnitStat & farm = this->unit_stats.at(static_cast<int>(UnitType::FARM));
    farm.attack_range = 0;
    farm.move_range = 0;
    farm.max_HP = 2;
    farm.cost = 50;
    farm.buildable = true;
    farm.income = 5;
    //farm.degrade_time = 50;
    farm.activation_delay = 1;

    UnitStat & house = this->unit_stats.at(static_cast<int>(UnitType::HOUSE));
    house.attack_range = 0;
    house.move_range = 0;
    house.max_HP = 2;
    house.buys_per_turn = 2;
    house.activation_delay = 3;
    house.cost = 100;
    house.buildable = true;
    house.can_make.add(UnitType::VILLAGER);

    UnitStat & barracks = this->unit_stats.at(static_cast<int>(UnitType::BARRACKS));
    barracks.attack_range = 0;
    barracks.move_range = 0;
    barracks.max_HP = 4;
    barracks.buys_per_turn = 1;
    barracks.activation_delay = 3;
    barracks.cost = 100;
    barracks.buildable = true;
    barracks.can_make.add(UnitType::SOLDIER);

    UnitStat & catapult_factory = this->unit_stats.at(static_cast<int>(UnitType::CATAPULT_FACTORY));
    catapult_factory.attack_range = 0;
    catapult_factory.move_range = 0;
    catapult_factory.max_HP = 4;
    catapult_factory.buys_per_turn = 1;
    catapult_factory.activation_delay = 5;
    catapult_factory.cost = 100;
    catapult_factory.buildable = true;
    catapult_factory.can_make.add(UnitType::CATAPULT);

    UnitStat & armory = this->unit_stats.at(static_cast<int>(UnitType::ARMORY));
    armory.attack_range = 0;
    armory.move_range = 0;
    armory.max_HP = 4;
    armory.buys_per_turn = 1;
    armory.activation_delay = 3;
    armory.cost = 300;
    armory.buildable = true;
    armory.can_make_equip.add(AttachType::ARMOR);

    UnitStat & BA_shop = this->unit_stats.at(static_cast<int>(UnitType::BA_SHOP));
    BA_shop.attack_range = 0;
    BA_shop.move_range = 0;
    BA_shop.max_HP = 4;
    BA_shop.buys_per_turn = 1;
    BA_shop.activation_delay = 3;
    BA_shop.cost = 200;
    BA_shop.buildable = true;
    BA_shop.can_make_equip.add(AttachType::BOW_AND_ARROW);

    UnitStat & sword_shop = this->unit_stats.at(static_cast<int>(UnitType::SWORD_SHOP));
    sword_shop.attack_range = 0;
    sword_shop.move_range = 0;
    sword_shop.max_HP = 4;
    sword_shop.buys_per_turn = 1;
    sword_shop.activation_delay = 3;
    sword_shop.cost = 100;
    sword_shop.buildable = true;
    sword_shop.can_make_equip.add(AttachType::SWORD);

    UnitStat & pike_shop = this->unit_stats.at(static_cast<int>(UnitType::PIKE_SHOP));
    pike_shop.attack_range = 0;
    pike_shop.move_range = 0;
    pike_shop.max_HP = 4;
    pike_shop.buys_per_turn = 1;
    pike_shop.activation_delay = 3;
    pike_shop.cost = 200;
    pike_shop.buildable = true;
    pike_shop.can_make_equip.add(AttachType::PIKE);

    UnitStat & stable = this->unit_stats.at(static_cast<int>(UnitType::STABLE));
    stable.attack_range = 0;
    stable.move_range = 0;
    stable.max_HP = 4;
    stable.buys_per_turn = 1;
    stable.activation_delay = 3;
    stable.cost = 300;
    stable.buildable = true;
    stable.can_make_equip.add(AttachType::HORSE);


    //fill attachment stats
    AttachmentStat & armor = this->attachments.at(static_cast<int>(AttachType::ARMOR));
    armor.slot = SlotType::TOP_RIGHT;
    armor.stat_alt.max_HP = 2;

    AttachmentStat & bow_and_arrow = this->attachments.at(static_cast<int>(AttachType::BOW_AND_ARROW));
    bow_and_arrow.slot = SlotType::TOP_LEFT;
    bow_and_arrow.stat_alt.attack_range = 2;

    AttachmentStat & sword = this->attachments.at(static_cast<int>(AttachType::SWORD));
    sword.slot = SlotType::TOP_LEFT;
    sword.stat_alt.attack_strength = 1;

    AttachmentStat & pike = this->attachments.at(static_cast<int>(AttachType::PIKE));
    pike.slot = SlotType::TOP_LEFT;
    pike.stat_alt.attack_range = 1;
    pike.stat_alt.attack_strength = 1;

    AttachmentStat & horse = this->attachments.at(static_cast<int>(AttachType::HORSE));
    horse.slot = SlotType::BOTTOM_RIGHT;
    horse.stat_alt.move_range = 2;
}
UnitStatus initial_status(UnitStat stats){
    UnitStatus status;
    status.attacked = false;
    status.moved = false;
    status.buys_left = stats.buys_per_turn;
    status.turns_til_active = stats.activation_delay;
    status.HP = stats.max_HP;
    return status;
}
