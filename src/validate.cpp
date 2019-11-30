#include "game.hpp"
#include "pathing.hpp"
#include <stdexcept>


void assert_empty(const Map & map, Point coord){
    if(map.at(coord).category != Category::EMPTY){
        throw std::runtime_error("Coordinate should be empty, was not");
    }
}
void assert_player_is(const Map & map, Point coord, Player player){
    if(map.at(coord).player != player){
        throw std::runtime_error("Targeted player other than self");
    }
}
void assert_player_is_not(const Map & map, Point coord, Player player){
    if(map.at(coord).player == player){
        throw std::runtime_error("Cannot attack yourself");
    }
}
void assert_actual_move(Point start,Point end){
    if(start != end){
        throw std::runtime_error("zero position moves invalid");
    }
}
void assert_actual_attack(Point start,Point end){
    if(start != end){
        throw std::runtime_error("units cannot attack themselves");
    }
}
void assert_is_unit(const Map & map, Point coord){
    if(map.at(coord).category != Category::UNIT){
        throw std::runtime_error("Coordinate should be unit, was not");
    }
}
void assert_hasnt_moved(const Unit & unit){
    if(unit.status.moved){
        throw std::runtime_error("tried to move unit twice in a single turn");
    }
}

void assert_in_range(const Map & map,Point start_coord,Point end_coord,int range){
    //bool is_possible_move(const Map & map,Point start,Point end,int range){
    if(distance(start_coord,end_coord) > range){
        throw std::runtime_error("Square out of range, distance too great.");
    }
    if(!(is_possible_move(map,start_coord,end_coord,range))){
        throw std::runtime_error("square out of range, blocked by unit.");
    }
}
void assert_movement_range(const Game & game,const MoveInfo & instr,const Unit & unit){
    int range = game.stats.total_stats(unit).move_range;
    assert_in_range(game.map,instr.start_coord,instr.end_coord,range);
}
void assert_active_player(const Game & game,Player player){
    if(game.players.active_player != player){
        throw std::runtime_error("You are not the active player and so you can make no moves.");
    }
}
void assert_unit_active(const Map & map,Point coord){
    int num_active_turns = map.at(coord).status.turns_til_active;
    if(num_active_turns > 0){
        throw std::runtime_error("Unit needs more turns until active");
    }
}
void assert_active_unit(const Game & game,Point coord,Player player){
    assert_is_unit(game.map,coord);
    assert_unit_active(game.map,coord);
    assert_player_is(game.map,coord,player);
    assert_active_player(game,player);
}
void valid_move(const Game & game,const MoveInfo & instr,Player player){
    assert_empty(game.map,instr.end_coord);
    assert_active_unit(game,instr.start_coord,player);
    assert_actual_move(instr.start_coord,instr.end_coord);
    Unit unit = game.map.at(instr.start_coord);
    assert_hasnt_moved(unit);
    assert_movement_range(game,instr,unit);
}
void assert_hasnt_attacked(const Unit & unit){
    if(unit.status.attacked){
        throw std::runtime_error("tried to use unit to attack twice in a single turn");
    }
}
void assert_is_possible_attack(const Game & game,const AttackInfo & instr,const Unit & unit){
    int range = game.stats.total_stats(unit).attack_range;
    if(!is_possible_attack(game.map,instr.source_coord,instr.target_coord,range)){
        throw std::runtime_error("Cannot attack target. Remember that attacks can only occur in strait lines and that attacking through a unit is not possible.");
    }
}
void valid_attack(const Game & game,const AttackInfo & instr,Player player){
    assert_active_unit(game,instr.source_coord,player);
    assert_is_unit(game.map,instr.target_coord);
    assert_player_is_not(game.map,instr.target_coord,player);
    assert_actual_attack(instr.source_coord,instr.target_coord);
    Unit unit = game.map.at(instr.source_coord);
    assert_hasnt_attacked(unit);
    assert_is_possible_attack(game,instr,unit);
}
//int get_money()
