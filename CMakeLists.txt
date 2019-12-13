cmake_minimum_required (VERSION 3.10)
project (ai-wars C CXX)

set(CPP_SOURCE_DIR ${PROJECT_SOURCE_DIR}/src)

include_directories(/usr/include/SDL/)
include_directories(${CPP_SOURCE_DIR})
include_directories(${CPP_SOURCE_DIR}/helpers)
if("${CMAKE_SIZEOF_VOID_P}" STREQUAL "8")
set(MAKE_GUI 1)
endif()

add_library(game_lib
    ${CPP_SOURCE_DIR}/validate.cpp
    ${CPP_SOURCE_DIR}/decompose_move.cpp
    ${CPP_SOURCE_DIR}/consume_move.cpp
    ${CPP_SOURCE_DIR}/default_stats.cpp
    ${CPP_SOURCE_DIR}/pathing.cpp
    ${CPP_SOURCE_DIR}/game_utils.cpp
    ${CPP_SOURCE_DIR}/genetic_movefinding.cpp
)
if(${MAKE_GUI})
add_executable(gui
    ${CPP_SOURCE_DIR}/gui.cpp
    ${CPP_SOURCE_DIR}/sdl_wrapper.cpp
)
endif()
add_executable(test_main
    ${CPP_SOURCE_DIR}/test_main.cpp
)
target_compile_options(game_lib PRIVATE -Wall -Wextra -Wno-unused-variable)

set_property(TARGET game_lib PROPERTY CXX_STANDARD 17)
if(${MAKE_GUI})
set_property(TARGET gui PROPERTY CXX_STANDARD 17)
endif()
set_property(TARGET test_main PROPERTY CXX_STANDARD 17)

if(${MAKE_GUI})
target_link_libraries(gui SDL2 game_lib)
endif()
target_link_libraries(test_main game_lib)
