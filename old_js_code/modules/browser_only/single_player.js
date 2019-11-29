var types = require("../logic_modules/types.js")
var init_game = require("../logic_modules/init_game.js")
var nav_signal = require("./nav_signal.js")
var SinglePlayerGame = require("./player_interface.js").SinglePlayerGame

var single_player_players = [
    "Player A",
    "Player B",
]

function execute_init_instr(gamesize,game_state,signals){
    process_instruction(game_state,init_instr,"__server",signals)
    signals.selectedData.setState(signals.selectedData.getState())
}
function create_single_player(){
    var player_order = single_player_players
    $("#game_not_started_message").hide()
    var gamesize = {
        xsize: 35,
        ysize: 35,
    }
    var init_instr = {
        type: "GAME_STARTED",
        game_size: gamesize,
        initial_creations: init_game.place_initial_units(gamesize,player_order),
        player_order: player_order,
        initial_money: 100,
        stats: types.default_stats,
    }
    var basediv = document.getElementById("single_page_game_overlay")
    var sing_play_game = new SinglePlayerGame(basediv,init_instr)
    nav_signal.change_page.fire("game_naventry")
}

module.exports = {
    create_single_player: create_single_player,
}
