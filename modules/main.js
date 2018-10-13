var get_serv_inf = require("./browser_only/get_server_info.js")
var load_images = require("./browser_only/load_images.js")
var display_board = require("./browser_only/display_board.js")

var game_types = require("./logic_modules/types.js")
var game_engine = require("./logic_modules/game_engine.js")
var $ = require('jquery');

var peer_con = null;

function interactive_setup_finished(peer_connection){
    console.log("interactive_setup_finished")
    peer_con = peer_connection
}
function start_game(){
    var game_data = game_engine.init_game();
    display_board.init_canvas()
    console.log(game_types.get_all_sources())
    load_images.on_load_all_images(game_types.get_all_sources(),function(){
        console.log("images loaded")
        display_board.draw_game(game_data)
    })
}

window.onload = function(){
    $("#single_player_choice").click(function(){
        $("#player_number_choice").hide()
        $("#game_page").show()
        start_game()
    })
    $("#multi_player_choice").click(function(){
        $("#player_number_choice").hide()
        $("#player_sync").show()
        get_serv_inf.on_init_socket(function(){
            get_serv_inf.setup_interactive(interactive_setup_finished)
        })
    })
}
