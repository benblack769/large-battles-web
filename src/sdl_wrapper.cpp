#include "sdl_wrapper.h"
#include <SDL2/SDL.h>

#include <iostream>
#include <cstdlib>

struct SDL_info{
    SDL_Window *win;
    SDL_Renderer *ren;
};

SDL_info* sdl_init(int xsize,int ysize,std::string name){
    if (SDL_Init(SDL_INIT_VIDEO) != 0){
    	std::cout << "SDL_Init Error: " << SDL_GetError() << std::endl;
    	exit(1);
    }
    SDL_Window *win = SDL_CreateWindow("Hello World!", 100, 100, 640, 480, SDL_WINDOW_SHOWN);
    if (win == nullptr){
    	std::cout << "SDL_CreateWindow Error: " << SDL_GetError() << std::endl;
    	SDL_Quit();
    	exit(1);
    }
    SDL_Renderer *ren = SDL_CreateRenderer(win, -1, SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC);
    if (ren == nullptr){
    	SDL_DestroyWindow(win);
    	std::cout << "SDL_CreateRenderer Error: " << SDL_GetError() << std::endl;
    	SDL_Quit();
    	exit(1);
    }
    SDL_info * info = new SDL_info;
    info->win = win;
    info->ren = ren;
    return info;
}
void destroy_sdl(SDL_info * info){
    SDL_DestroyRenderer(info->ren);
    SDL_DestroyWindow(info->win);
    SDL_Quit();
    delete info;
}
SDL_Texture * sdl_load_bitmap(SDL_info * info,std::string imagePath){
    SDL_Surface *bmp = SDL_LoadBMP(imagePath.c_str());
    if (bmp == nullptr){
    	SDL_DestroyRenderer(info->ren);
    	SDL_DestroyWindow(info->win);
    	std::cout << "SDL_LoadBMP Error: " << SDL_GetError() << std::endl;
    	SDL_Quit();
    	exit(1);
    }
    SDL_Texture *tex = SDL_CreateTextureFromSurface(info->ren, bmp);
    SDL_FreeSurface(bmp);
    if (tex == nullptr){
    	SDL_DestroyRenderer(info->ren);
    	SDL_DestroyWindow(info->win);
    	std::cout << "SDL_CreateTextureFromSurface Error: " << SDL_GetError() << std::endl;
    	SDL_Quit();
    	exit(1);
    }
    return tex;
}
bool should_exit(){
    return SDL_QuitRequested();
}
void sdl_clear_screen(SDL_info * info){
	SDL_RenderClear(info->ren);
}
void present(SDL_info * info){
   SDL_RenderPresent(info->ren);
}
void sdl_draw_bitmap(SDL_info * info,SDL_Texture * tex,int xpos,int ypos){
    Uint32 f;
    int a,w,h;
    int e = SDL_QueryTexture(tex,&f,&a,&w,&h);
    SDL_Rect DestR;
    SDL_Rect SrcR;
std::cout << w << " " << h << "\n";
          DestR.x = xpos;
          DestR.y = ypos;
          DestR.w = w;
          DestR.h = h;
                SrcR.x = xpos;
                SrcR.y = ypos;
                SrcR.w = w;
                SrcR.h = h;
     int err = SDL_RenderCopy(info->ren, tex, NULL, &DestR);
     if(err < 0){
         std::cout << "SDL draw bitmap Error: " << SDL_GetError() << std::endl;
     	exit(err);
     }
}
