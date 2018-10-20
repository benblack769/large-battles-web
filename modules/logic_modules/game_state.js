function GameState(num_players) {
    this.num_players = num_players
    this.player_turn = 0
    this.end_turn = function(player_num){
        if(this.player_turn === player_num){
            this.player_turn = (this.player_turn + 1) % this.num_players
            return true
        }
        else{
            return false
        }
    }
}
