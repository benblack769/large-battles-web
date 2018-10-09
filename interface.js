var canvas;
var context;
var sqr_size = 30;

function draw_image(filename,x,y){
    var image = document.getElementById(filename)
    context.drawImage(image,x*sqr_size,y*sqr_size)
}
function draw_square(x,y,square_data){
    draw_image(background_icon,x,y)
    if(square_data.category == "unit"){
        var icon = square_data['icon']
        draw_image(icon,x,y)
    }
}
function draw_game(game_data){
    for(var x = 0; x < x_size; x++){
        for(var y = 0; y < y_size; y++){
            draw_square(x,y,game_data[y][x])
        }
    }
}
function on_load_all_images(image_sources, function_to_call){
    // calls function when all images are loaded
    var inc_counter = 0;
    var parent_el = document.getElementById("canvas_images")
    image_sources.forEach(function(source){
        var image = document.createElement("img")
        image.src = "images/"+source
        image.id = source
        image.addEventListener( 'load', function(){
            inc_counter++;
            if(inc_counter == image_sources.length){
                function_to_call()
            }
        })
        parent_el.appendChild(image)
    })
}
function get_all_sources(){
    var unit_icons = Object.values(unit_types).map(type=>type['icon'])
    var base_icons = [background_icon]
    return unit_icons.concat(base_icons)
}
function start_animate(game_data){
    requestAnimationFrame(function(){
            console.log("frame drawn")
        start_animate(game_data)
    })
}
window.onload = function(){
    var game_data = init_game();
    game_data[2][3] = create_unit("soldier",unit_types["soldier"])
    canvas = document.getElementById("myCanvas");
    context = canvas.getContext("2d");
    console.log(get_all_sources())
    on_load_all_images(get_all_sources(),function(){
        console.log("images loaded")
        draw_game(game_data)
    })
}
