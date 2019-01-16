var navigation = require("./browser_only/page_navigation.js")
var nav_signal = require("./browser_only/nav_signal.js")

function downloadJSAtOnload(src) {
    var element = document.createElement("script");
    element.src = src
    document.body.appendChild(element);
}


window.onload = function(){
    //downloadJSAtOnload("tf.js")
    navigation.init_all()
    nav_signal.change_page.fire("live_connect_naventry")
}
