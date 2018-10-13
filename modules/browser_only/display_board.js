var type_info = require("../logic_modules/types.js")

var canvas;
var context;
var sqr_size = 30;

function draw_image(filename,x,y){
    var image = document.getElementById(filename)
    context.drawImage(image,x*sqr_size,y*sqr_size)
}
function draw_square(x,y,square_data){
    draw_image(type_info.background_icon,x,y)
    if(square_data.category == "unit"){
        var icon = square_data['icon']
        draw_image(icon,x,y)
    }
}
function draw_game(game_data){
    for(var y = 0; y < game_data.length; y++){
        for(var x = 0; x < game_data[y].length; x++){
            draw_square(x,y,game_data[y][x])
        }
    }
}
function init_canvas(){
    canvas = document.getElementById("myCanvas");
    context = canvas.getContext("2d");
}
module.exports = {
    init_canvas:init_canvas,
    draw_game: draw_game,
}
