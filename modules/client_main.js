var navigation = require("./browser_only/page_navigation.js")
var nav_signal = require("./browser_only/nav_signal.js")

function getInt(offset){
    return Module.HEAP32.subarray(offset/4,offset/4+2)
}
window.onload = function(){
    //console.log("execuint wasm")
    //exec_wasm()
    var add = Module.cwrap("add",'number',['number','number'])
    var print = Module.cwrap("malc",'number',[])
    var sum_array = Module.cwrap("sum_array",'number',['array'])
    var res = add(192,34)
    var offset = Module._malloc(24)
    var malc_offset = print();
    Module._free(offset)
    console.log(sum_array(new Uint8Array(new Float64Array([7,11,1002]).buffer)))
    console.log(res)
    console.log("offset")
    console.log(malc_offset)
    console.log(getInt(malc_offset))
    console.log(offset)
    navigation.init_all()
    nav_signal.change_page.fire("live_connect_naventry")
}
