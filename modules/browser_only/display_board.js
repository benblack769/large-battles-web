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
function copy_rect(ctx,start_coord, end_coord){
    var sc = start_coord
    var ec = end_coord
    var imgData = ctx.getImageData(sc.x*sqr_size,sc.y*sqr_size,sqr_size,sqr_size);
    ctx.putImageData(imgData,ec.x*sqr_size,ec.y*sqr_size);
}
function stroke_rect(ctx, coord, strokecolor){
    ctx.strokeStyle=strokecolor;
    ctx.strokeRect(coord.x*sqr_size,
    coord.y*sqr_size,
    sqr_size,
    sqr_size);
}
function fill_rect(ctx, coord, fillcolor){
    ctx.fillStyle=fillcolor;
    ctx.fillRect(coord.x*sqr_size,
                coord.y*sqr_size,
                sqr_size,
                sqr_size);
}
function draw_image(context,filename,coord){
    var image = document.getElementById(filename)
    context.drawImage(image,coord.x*sqr_size,coord.y*sqr_size)
}
function draw_background(context, xsize, ysize){
    var background_image = document.getElementById(type_info.icons.background_icon)
    for(var y = 0; y < ysize; y++){
        for(var x = 0; x < xsize; x++){
            //stroke_rect(context,{x:x,y:y},"black")
            context.drawImage(background_image,x*sqr_size,y*sqr_size)
        }
    }
}
module.exports = {
    draw_background: draw_background,
    get_game_pixel_size: get_game_pixel_size,
    get_game_coords_from_pixels: get_game_coords_from_pixels,
    game_position_to_pix: game_position_to_pix,
    clear_rect: clear_rect,
    draw_image: draw_image,
    copy_rect: copy_rect,
    stroke_rect: stroke_rect,
    fill_rect: fill_rect,
}
