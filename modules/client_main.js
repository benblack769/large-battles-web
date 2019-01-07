var navigation = require("./browser_only/page_navigation.js")
var nav_signal = require("./browser_only/nav_signal.js")


window.onload = function(){
    //console.log("execuint wasm")
    //exec_wasm()
    var add = Module.cwrap("add",'number',['number','number'])
    var res = add(192,34)
    console.log(res)
    navigation.init_all()
    nav_signal.change_page.fire("live_connect_naventry")
}
