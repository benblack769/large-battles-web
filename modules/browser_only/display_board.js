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
function p2(v){
    return v+0.5
}
function draw_timer_arc(ctx,coord,startrad,endrad,color){
    var radius = sqr_size*0.35
    var cx = (coord.x+0.5)*sqr_size
    var cy = (coord.y+0.5)*sqr_size
    ctx.fillStyle=color;
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,radius,startrad,endrad,true);
    //ctx.stroke();
    ctx.fill();
}
function draw_timer(ctx,coord,percent_done,primary_color,secondary_color){
    var start_rad = 1.5*Math.PI
    var tot_rad = 2*Math.PI
    draw_timer_arc(ctx, coord, start_rad, start_rad-percent_done*tot_rad, primary_color)
    draw_timer_arc(ctx, coord, start_rad-percent_done*tot_rad, start_rad-tot_rad, secondary_color)
}
function draw_player_marker(ctx,coord,color){
    draw_mini_circle(ctx,coord,color,0.8,0.8)
}
function draw_mini_circle(ctx,coord,color,offx,offy){
    ctx.fillStyle=color;
    ctx.beginPath();
    ctx.arc((coord.x+offx)*sqr_size,(coord.y+offy)*sqr_size,2.7,0,2*Math.PI);
    ctx.fill();
}
function draw_line(ctx,c1,c2){
    ctx.strokeStyle="black";
    ctx.beginPath();
    ctx.moveTo(p2(c1.x)*sqr_size,p2(c1.y)*sqr_size);
    ctx.lineTo(p2(c2.x)*sqr_size,p2(c2.y)*sqr_size);
    ctx.stroke();
    draw_mini_circle(ctx,c1,"black",0.5,0.5)
    draw_mini_circle(ctx,c2,"black",0.5,0.5)
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
function fill_center_rect(ctx, cen_coord, fillcolor, radius){
    ctx.fillStyle=fillcolor;
    ctx.fillRect((cen_coord.x-radius)*sqr_size,
                (cen_coord.y-radius)*sqr_size,
                sqr_size*(radius*2+1),
                sqr_size*(radius*2+1));
}
function clear_center_rect(ctx, cen_coord, radius){
    ctx.clearRect((cen_coord.x-radius)*sqr_size,
                (cen_coord.y-radius)*sqr_size,
                sqr_size*(radius*2+1),
                sqr_size*(radius*2+1));
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
    fill_center_rect: fill_center_rect,
    clear_center_rect: clear_center_rect,
    fill_rect: fill_rect,
    draw_line: draw_line,
    draw_mini_circle: draw_mini_circle,
    draw_timer: draw_timer,
    draw_player_marker: draw_player_marker,
}
