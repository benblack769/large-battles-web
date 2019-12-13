#include "game.hpp"
#include <iostream>
#include "game_utils.hpp"
#include "movefinding.hpp"


int main(){
    const Point gamesize{35,37};
    Game game;
    InitGameInfo init_info{.game_size=gamesize,
                          .start_player=Player::RED,
                          .initial_money=50
                          };
    for(Point p : point_range(Point{2,5})){
        std::cout << p << "\n";
    }
    Map map(Point{3,6});
    std::cout << map.shape() << "\n";
     map.at(Point{2,5}).player;
    GameMove move{.move=MoveType::GAME_STARTED,
                    .info=JoinedInfo{.init_game=init_info}};
    exec_gamemove(game,move);
    std::cout << game.map.shape() << "\n";
    game.players.active_player = Player::RED;
    for(int i = 0; i < 100000; i++){
        MoveList moves = genetic_movefinding(game);
        for(GameMove move : moves){
            assert(is_valid(game,move,game.players.active_player));
            exec_gamemove(game,move);
        }
        std::cout <<moves.size() << "\n";
        GameMove end_turn_move{
            .move=MoveType::END_TURN,.info=JoinedInfo{}
        };
        exec_gamemove(game,end_turn_move);
        std::cout << game.players.order[0].money << " " << game.players.order[1].money << "\n";
    }
}
