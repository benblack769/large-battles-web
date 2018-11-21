
var request = require('request')


function log_game_result(){
    var req_options = {
        uri: 'http://localhost:8804/log_game_result',
        method: 'POST',
        json: {
            "game_id": "EXAMPLE_GAME_ID",
            "results": [
                {
                    username: "user1",
                    winrecord: "victory",
                },
                {
                    username: "user2",
                    winrecord: "defeat",
                }
            ],
        }
    };

    request(req_options, function (error, response, body) {
        if(error){
            console.log(error)
        }
        else if (response.statusCode != 200) {
            console.log("log reqeust status"+response.statusCode)
            console.log(body)
        }
        else{
            console.log("successfully logged results")
        }
    });
}
log_game_result()
