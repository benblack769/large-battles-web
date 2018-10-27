var get_serv_inf = require("./browser_only/get_server_info.js")
var load_images = require("./browser_only/load_images.js")
var display_board = require("./browser_only/display_board.js")

var game_types = require("./logic_modules/types.js")
var game_engine = require("./logic_modules/game_engine.js")
var signup_login = require("./browser_only/signup_login.js")
var rankings_page = require("./browser_only/rankings_page.js")
var live_connections = require("./browser_only/live_connections_page.js")

var peer_con = null;

function switch_away_from_all(){
    live_connections.switch_away_from_live_games()
}
function setup_page_navigation(){
    $("#signup_naventry").click(function(){
        switch_away_from_all()
        signup_login.switch_to_signup()
    })
    $("#login_naventry").click(function(){
        switch_away_from_all()
        signup_login.switch_to_login()
    })
    $("#logout_naventry").click(function(){
        signup_login.logout()
    })
    $("#rankings_naventry").click(function(){
        switch_away_from_all()
        rankings_page.switch_to_rankings()
    })
    $("#live_connect_naventry").click(function(){
        switch_away_from_all()
        live_connections.switch_to_live_games()
    })
}

function init_all(){
    setup_page_navigation()
    signup_login.init_signup_login()
    rankings_page.init_rankings()
    live_connections.init_live_games()
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
    init_all()
    signup_login.switch_to_signup()
    /*$("#single_player_choice").click(function(){
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
    })*/
}
