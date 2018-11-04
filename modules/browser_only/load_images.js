function imgLoaded(imgElement) {
  return imgElement.complete && imgElement.naturalHeight !== 0;
}
function on_load_all_images(image_sources, function_to_call){
    // calls function when all images are loaded
    var inc_counter = 0;
    image_sources.forEach(function(source){
        var image = document.getElementById(source)
        function image_loaded(){
            inc_counter++;
            if(inc_counter == image_sources.length){
                function_to_call()
            }
        }
        if(imgLoaded(image)){
            image_loaded()
        }
        else{
            image.addEventListener( 'load', image_loaded)
        }
    })
}
module.exports = {
    on_load_all_images: on_load_all_images,
}
