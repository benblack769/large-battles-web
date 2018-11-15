function default_set_data(json_data){
    self.set_data = json_data
    if(self.on_set_fn){
        //if set_fn is defined in library, call it too.
        self.on_set_fn(json_data)
    }
}
self.click_handler = function(click){
    console.log("default click activated. You need to set 'self.click_handler' in your library code")
}
self.set_data = {}
self.globals = {}
function replace_lib(js_code){
    //console.log("replaced library with: "+js_code)
    self.globals = {};
    (new Function(js_code))()
}
onmessage = function(message){
    var message = message.data
    switch(message.type){
        case "REPLACE_FUNCTION": default_set_data(JSON.parse(message.json_data)); break;
        case "REPLACE_LIBRARY": replace_lib(message.js_str); break;
        case "CLICK_OCCURED": click_handler(message.coord); break;
    }
}
