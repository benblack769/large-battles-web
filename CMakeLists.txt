cmake_minimum_required (VERSION 3.10)
project (ai-wars C CXX)

set(CPP_SOURCE_DIR ${PROJECT_SOURCE_DIR}/src)

#find_library(SDL)
#find_file(SDL2_INCLUDE_DIR NAME SDL.h HINTS SDL2)
#find_library(SDL2_LIBRARY NAME SDL2)
#find_package(SDL2 REQUIRED)
include_directories(/usr/include/SDL/)

#link_directories( "${PROJECT_SOURCE_DIR}/Quest_")
#include_directories("${PROJECT_SOURCE_DIR}/QuEST_/include/" "${PROJECT_SOURCE_DIR}/metis-5.1.0/include")

#add_library(quant_circ_lib
#    ${CPP_SOURCE_DIR}/graph_partition.cpp
#)
add_executable(gui
    ${CPP_SOURCE_DIR}/gui.cpp
    ${CPP_SOURCE_DIR}/sdl_wrapper.cpp
)
set_property(TARGET gui PROPERTY CXX_STANDARD 14)
target_link_libraries(gui SDL2)
