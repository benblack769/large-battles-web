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
module.exports = {
    on_load_all_images: on_load_all_images,
}
