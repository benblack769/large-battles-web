#include "game_utils.hpp"

int get_player_assets(const Game & game,Player player){
    int sum = 0;
    for(const MapItem & item : game.map.Data){
        if(is_player(item,player)){
            sum += game.stats.total_stats(item.unit).cost;
        }
    }
    return sum;
}
int get_current_income(const Game & game,Player player){
    int sum = 0;
    for(const MapItem & item : game.map.Data){
        if(is_player(item,player)){
            sum += game.stats.total_stats(item.unit).income;
        }
    }
    return sum;
}
void exec_gamemove(Game & game, const GameMove & instr){
    MoveAccum accum;
    decomp_gamemove(accum,game,instr);
    for(DecompMove & decomp : accum){
        consume_decomped(game,decomp);
    }
}
Heuristics get_heuristcs(const Game & game,Player player){
    int cash = game.players.get(player).money;
    int income = get_current_income(game,player);
    int military_assets = 0;
    int other_assets = 0;
    for(MapItem item : game.map.Data){
        if(is_player(item,player)){
            UnitStat ustat = game.stats.total_stats(item.unit);
            int cur_cost = ustat.cost;
            bool is_military = ustat.attack_range > 1;
            if(is_military){
                military_assets += cur_cost;
            }
            else{
                other_assets += cur_cost;
            }
        }
    }
    return Heuristics {
        cash,
        income,
        military_assets,
        other_assets
    };
}
