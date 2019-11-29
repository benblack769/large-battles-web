var basecomp = require("./base_component.js")

var createEL = basecomp.createEL
var createDiv = basecomp.createDiv
var createSpan = basecomp.createSpan

function make_info_display(display_text){
     var basediv = document.getElementById("single_player_page")
     function hide_this(){
         $(newdiv).remove()
     }
     var newdiv = createDiv({
         parent: basediv,
         className: "gray_page_overlay",
        // onclick: hide_this,
         children: [
             createDiv({
                 className: "central_cancel_box",
                 children: [
                     createDiv({
                         className: "central_cancel_message horizontal-center",
                         innerText: display_text,
                     }),
                     createDiv({
                         className: "central_cancel_button_holder",
                         children: [
                             createSpan({
                                 className: "central_cancel_button",
                                 innerText: "Ok",
                                 onclick: hide_this,
                             })
                         ],
                     }),
                 ]
             })
         ]
     })
}
module.exports = {
    make_info_display:make_info_display
}
