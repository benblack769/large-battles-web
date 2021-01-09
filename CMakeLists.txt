cmake_minimum_required (VERSION 3.10)
project (ai-wars C CXX)

set(CPP_SOURCE_DIR ${PROJECT_SOURCE_DIR}/src)

include_directories(/usr/include/SDL/)
include_directories(${PROJECT_SOURCE_DIR})
include_directories(${CPP_SOURCE_DIR})
include_directories(${CPP_SOURCE_DIR}/helpers)
link_directories(${CMAKE_CURRENT_SOURCE_DIR}/bin/)
if(WIN32)
set(IMPORT_SDL 1)
else()
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
add_executable(gui
    ${CPP_SOURCE_DIR}/gui.cpp
    ${CPP_SOURCE_DIR}/sdl_wrapper.cpp
)
if(${IMPORT_SDL})
    add_custom_command(TARGET gui POST_BUILD        # Adds a post-build event to MyTest
        COMMAND ${CMAKE_COMMAND} -E copy_if_different
        ${PROJECT_SOURCE_DIR}/bin/SDL2.dll
        ${CMAKE_BINARY_DIR}/SDL2.dll)
    #add_custom_command(TARGET ${RUNTIME_OUTPUT_DIRECTORY}/SDL2.dll COMMAND cp ${PROJECT_SOURCE_DIR}/bin/SDL2.dll ${RUNTIME_OUTPUT_DIRECTORY}/SDL2.dll)
endif()
file(COPY ${PROJECT_SOURCE_DIR}/images DESTINATION  ${CMAKE_BINARY_DIR})
add_custom_command(TARGET gui POST_BUILD        # Adds a post-build event to MyTest
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
    ${PROJECT_SOURCE_DIR}/images
    ${CMAKE_BINARY_DIR}/images)
add_executable(test_main
    ${CPP_SOURCE_DIR}/test_main.cpp
)
target_compile_options(game_lib PRIVATE -Wall -Wextra -Wno-unused-variable )
target_compile_options(game_lib PRIVATE -fno-exceptions -fno-rtti )

set_property(TARGET game_lib PROPERTY CXX_STANDARD 17)
set_property(TARGET gui PROPERTY CXX_STANDARD 17)
set_property(TARGET test_main PROPERTY CXX_STANDARD 17)

target_link_libraries(gui SDL2 game_lib)
target_link_libraries(test_main game_lib)
