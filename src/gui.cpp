#include "sdl_wrapper.h"
#include <thread>
#include <iostream>
#include "unit.h"
#include "game_utils.hpp"

std::string background_fname(){
    return "Background.bmp";
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
    default: throw std::runtime_error("bad unit type to get_fname");
    }
}
std::string get_fname(AttachType attch){
    switch(attch){
    case AttachType::ARMOR: return "armor.bmp";
    case AttachType::BOW_AND_ARROW: return "bow-arrow.bmp";
    case AttachType::SWORD: return "sword.bmp";
    case AttachType::PIKE: return "pike.bmp";
    case AttachType::HORSE: return "horse.bmp";
    default: throw std::runtime_error("bad attach type to get_fname");
    }
}
class Renderer{
    int img_size;
    Point gamesize;
    AttachArray<SDL_Texture*> attach_textures;
    UnitArray<SDL_Texture*> unit_textures;
    SDL_Texture* background;
    SDL_info * sdl;
public:
    Renderer(Point gamesize,int img_size){
        this->img_size = img_size;
        this->gamesize = gamesize;
        sdl = sdl_init(img_size*gamesize.X,img_size*gamesize.Y,"hithere");
        background = sdl_load_bitmap(sdl,"images/"+background_fname());
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
            Unit u = map[p];
            Point dp = p * img_size;
            sdl_draw_bitmap(sdl,background,dp.X,dp.Y);
            if(u.category == Category::UNIT){
                sdl_draw_bitmap(sdl,unit_textures[u.unit_type],dp.X,dp.Y);
                for(SlotType slot : all_slots()){
                    if(u.attachments.slot_filled(slot)){
                        sdl_draw_bitmap(sdl,attach_textures[u.attachments.at(slot)],dp.X,dp.Y);
                    }
                }
            }
        }
        present(sdl);
    }
};

int main(){
    const Point gamesize(35,37);
    const int img_size = 30;
    Renderer renderer(gamesize,img_size);
    Game game;
    while(!should_exit()){
        renderer.refresh_screen();
        std::this_thread::sleep_for(std::chrono::milliseconds(200));
    }

}
