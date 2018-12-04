var navigation = require("./browser_only/page_navigation.js")
var nav_signal = require("./browser_only/nav_signal.js")

window.onload = function(){
    navigation.init_all()
    nav_signal.change_page.fire("live_connect_naventry")
}
