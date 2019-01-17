var navigation = require("./browser_only/page_navigation.js")
var nav_signal = require("./browser_only/nav_signal.js")
var init_ai = require("./browser_only/init_ai.js")


window.onload = function(){
    init_ai.init_ai_code()
    navigation.init_all()
    nav_signal.change_page.fire("live_connect_naventry")
}
