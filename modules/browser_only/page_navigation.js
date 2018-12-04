var display_board = require("./display_board.js")
var signup_login = require("./signup_login.js")
var rankings_page = require("./rankings_page.js")
var live_connections = require("./live_connections_page.js")
var game_page = require("./game_page.js")
var nav_signal = require("./nav_signal.js")

function switch_away_from_all(){
    live_connections.switch_away_from_live_games()
    game_page.switch_away_from_game_page()
}
function setup_page_navigation(){
    $("#signup_naventry").click(function(){
        switch_to_page("signup_naventry")
    })
    $("#login_naventry").click(function(){
        switch_to_page("login_naventry")
    })
    $("#logout_naventry").click(function(){
        switch_to_page("logout_naventry")
    })
    $("#rankings_naventry").click(function(){
        switch_to_page("rankings_naventry")
    })
    $("#live_connect_naventry").click(function(){
        switch_to_page("live_connect_naventry")
    })
    $("#game_naventry").click(function(){
        switch_to_page("game_naventry")
    })
}
function switch_to_page(page_id){
    switch_away_from_all()
    switch(page_id){
        case "signup_naventry": signup_login.switch_to_signup(); break;
        case "login_naventry": signup_login.switch_to_login(); break;
        case "logout_naventry": signup_login.logout(); break;
        case "rankings_naventry": rankings_page.switch_to_rankings(); break;
        case "live_connect_naventry": live_connections.switch_to_live_games(); break;
        case "game_naventry": game_page.switch_to_game_page(); break;
    }}
function init_page_switching(){
    nav_signal.change_page.listen(switch_to_page)
}

function init_all(){
    setup_page_navigation()
    signup_login.init_signup_login()
    rankings_page.init_rankings()
    live_connections.init_live_games()
    game_page.init_game_page()
    init_page_switching()
    //single_player.init_single_player()
    //multi_player.init_multi_player()
}

module.exports = {
    //setup_page_navigation: setup_page_navigation,
    init_all: init_all,
}
