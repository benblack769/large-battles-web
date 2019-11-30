cmake_minimum_required (VERSION 3.10)
project (ai-wars C CXX)

set(CPP_SOURCE_DIR ${PROJECT_SOURCE_DIR}/src)

include_directories(/usr/include/SDL/)
include_directories(${CPP_SOURCE_DIR})
include_directories(${CPP_SOURCE_DIR}/helpers)

add_library(game_lib
    ${CPP_SOURCE_DIR}/validate.cpp
    ${CPP_SOURCE_DIR}/make_move.cpp
    ${CPP_SOURCE_DIR}/default_stats.cpp
    ${CPP_SOURCE_DIR}/pathing.cpp
)
#add_executable(gui
#    ${CPP_SOURCE_DIR}/gui.cpp
#    ${CPP_SOURCE_DIR}/sdl_wrapper.cpp
#)
add_executable(test_main
    ${CPP_SOURCE_DIR}/test_main.cpp
)
set_property(TARGET game_lib PROPERTY CXX_STANDARD 14)
#set_property(TARGET gui PROPERTY CXX_STANDARD 14)
set_property(TARGET test_main PROPERTY CXX_STANDARD 14)

#target_link_libraries(gui SDL2 game_lib)
target_link_libraries(test_main game_lib)
