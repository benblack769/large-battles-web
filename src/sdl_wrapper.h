#pragma once
#include <string>

struct SDL_info;
struct SDL_Texture;

SDL_info * sdl_init(int xsize,int ysize,std::string name);
SDL_Texture * sdl_load_bitmap(SDL_info * info,std::string path);
void sdl_draw_bitmap(SDL_info * info,SDL_Texture * tex,int xpos,int ypos);
void sdl_clear_screen(SDL_info * info);
void present(SDL_info * info);
void destroy_sdl(SDL_info * info);
