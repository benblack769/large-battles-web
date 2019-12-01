#include "game_utils.hpp"

int get_player_assets(const Game & game,Player player){
    int sum = 0;
    for(const Unit & unit : game.map.Data){
        if(unit.player == player){
            sum += game.stats.total_stats(unit).cost;
        }
    }
    return sum;
}
int get_current_income(const Game & game,Player player){
    int sum = 0;
    for(const Unit & unit : game.map.Data){
        if(unit.player == player){
            sum += game.stats.total_stats(unit).income;
        }
    }
    return sum;
}
