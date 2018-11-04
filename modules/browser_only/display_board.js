var type_info = require("../logic_modules/types.js")

var sqr_size = 30;

function get_game_pixel_size(xsize,ysize){
    return {
        xsize: xsize * sqr_size,
        ysize: ysize * sqr_size,
    }
}
function game_position_to_pix(xpos,ypos){
    return {
        x: 0 - xpos * sqr_size,
        y: 45 - ypos * sqr_size
    }
}
function get_game_coords_from_pixels(xpix,ypix){
    return {
        x: Math.floor(xpix / 30.0),
        y: Math.floor(ypix / 30.0),
    }
}
function clear_rect(ctx,coord){
    ctx.clearRect(coord.x*sqr_size-1,
                coord.y*sqr_size-1,
                sqr_size+2,
                sqr_size+2);
}
function draw_rect(ctx, coord, fillcolor, strokecolor){
    ctx.fillStyle=fillcolor;
    ctx.fillRect(coord.x*sqr_size,
                coord.y*sqr_size,
                sqr_size,
                sqr_size);
    ctx.strokeStyle=strokecolor;
    ctx.strokeRect(coord.x*sqr_size,
                coord.y*sqr_size,
                sqr_size,
                sqr_size);
}
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
function draw_background(context, xsize, ysize){
    var background_image = document.getElementById(type_info.background_icon)
    for(var y = 0; y < ysize; y++){
        for(var x = 0; x < xsize; x++){
            context.drawImage(background_image,x*sqr_size,y*sqr_size)
        }
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
    draw_background: draw_background,
    get_game_pixel_size: get_game_pixel_size,
    get_game_coords_from_pixels: get_game_coords_from_pixels,
    draw_rect: draw_rect,
    game_position_to_pix: game_position_to_pix,
    clear_rect: clear_rect,
}
