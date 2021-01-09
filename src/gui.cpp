#include "sdl_wrapper.h"
#include <thread>
#include <iostream>
#include <cassert>
#include "unit.h"
#include "game_utils.hpp"
#include "movefinding.hpp"

std::string get_fname(LandType land){
    switch(land){
    case LandType::FERTILE:return "Background.bmp";
    case LandType::BARREN:return "Background_infertile.bmp";
    default: assert(false && "bad land type to get_fname");
    }
}
std::string get_fname(UnitType unit){
    switch(unit){
    case UnitType::SOLDIER:return "Soldier.bmp";
    case UnitType::CATAPULT:return "Catapult.bmp";
    case UnitType::VILLAGER:return "villager.bmp";
    case UnitType::HOUSE:return "house.bmp";
    case UnitType::FARM:return "farm.bmp";
    case UnitType::BARRACKS:return "barracks.bmp";
    case UnitType::ARMORY:return "armory.bmp";
    case UnitType::BA_SHOP:return "bow-arrow-shop.bmp";
    case UnitType::SWORD_SHOP:return "sword-shop.bmp";
    case UnitType::PIKE_SHOP:return "pike-shop.bmp";
    case UnitType::STABLE:return "stable.bmp";
    case UnitType::CATAPULT_FACTORY:return "catapult-factory.bmp";
    default: assert(false && "bad unit type to get_fname");
    }
}
std::string get_fname(AttachType attch){
    switch(attch){
    case AttachType::ARMOR: return "armor.bmp";
    case AttachType::BOW_AND_ARROW: return "bow-arrow.bmp";
    case AttachType::SWORD: return "sword.bmp";
    case AttachType::PIKE: return "pike.bmp";
    case AttachType::HORSE: return "horse.bmp";
    default: assert(false && "bad attach type to get_fname");
    }
}
class Renderer{
    int img_size;
    Point gamesize;
    AttachArray<SDL_Texture*> attach_textures;
    LandArray<SDL_Texture*> land_textures;
    UnitArray<SDL_Texture*> unit_textures;
    SDL_info * sdl;
public:
    Renderer(Point gamesize,int img_size){
        this->img_size = img_size;
        this->gamesize = gamesize;
        sdl = sdl_init(img_size*gamesize.x,img_size*gamesize.y,"hithere");
        for(LandType land : all_land_types()){
            land_textures[land] = sdl_load_bitmap(sdl,"images/"+get_fname(land));
        }
        for(AttachType att : all_attachs()){
            attach_textures[att] = sdl_load_bitmap(sdl,"images/"+get_fname(att));
        }
        for(UnitType unit : all_units()){
            unit_textures[unit] = sdl_load_bitmap(sdl,"images/"+get_fname(unit));
        }
    }
    ~Renderer(){
        destroy_sdl(sdl);
    }
    void refresh_screen(const Map & map){
        sdl_clear_screen(sdl);
        for(Point p : point_range(gamesize)){
            MapItem u = map.at(p);
            Point dp = p * img_size;
            sdl_draw_bitmap(sdl,land_textures[u.land],dp.x,dp.y);
            if(u.category == Category::UNIT){
                sdl_draw_bitmap(sdl,unit_textures[u.unit.unit_type],dp.x,dp.y);
                for(SlotType slot : all_slots()){
                    if(u.unit.attachments.slot_filled(slot)){
                        std::cout << static_cast<int>(u.unit.attachments.at(slot)) << std::endl;
                        sdl_draw_bitmap(sdl,attach_textures[u.unit.attachments.at(slot)],dp.x,dp.y);
                    }
                }
            }
        }
        present(sdl);
    }
};

int main(){
    const Point gamesize{35,35};
    const int img_size = 30;
    Renderer renderer(gamesize,img_size);
    Game game;
    //game.map = Map(gamesize.X,gamesize.Y);
    InitGameInfo init_info{.game_size=gamesize,
                          .start_player=Player::RED,
                          .initial_money=50
                          };
    GameMove move{.move=MoveType::GAME_STARTED,
                    .info=JoinedInfo{.init_game=init_info}};
    exec_gamemove(game,move);
    std::cout << "initted succesfuuly" << std::endl;
    std::cout << game.map.shape() << std::endl;
    while(!should_exit()){
        /*MoveList moves = genetic_movefinding(game);
        for(GameMove move : moves){
            assert(is_valid(game,move,game.players.active_player));
            //exec_gamemove(game,move);
        }*/
        GameMove end_turn_move{
            .move=MoveType::END_TURN,.info=JoinedInfo{}
        };
        exec_gamemove(game,end_turn_move);
        renderer.refresh_screen(game.map);
        std::this_thread::sleep_for(std::chrono::milliseconds(2));
    }
}
