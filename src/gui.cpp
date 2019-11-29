#include "sdl_wrapper.h"
#include <thread>
#include <iostream>
#include <SDL2/SDL.h>



int main(){
    SDL_info *sdl = sdl_init(100,100,"hithere");
    SDL_Texture * tex1 = sdl_load_bitmap(sdl,"images/armor.bmp");
    SDL_Texture * tex2 = sdl_load_bitmap(sdl,"images/armory.bmp");
    std::cout << tex1 << std::endl;
    while(!SDL_QuitRequested()){
        sdl_clear_screen(sdl);
        sdl_draw_bitmap(sdl,tex1,0,0);
        sdl_draw_bitmap(sdl,tex2,5,5);
        present(sdl);
        std::this_thread::sleep_for(std::chrono::milliseconds(200));
    }
    destroy_sdl(sdl);
}
