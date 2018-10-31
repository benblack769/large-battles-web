

function switch_to_single_player(){
    console.log("switched to single player")
    $(".page_level").hide()
    $("#single_player_page").show()
}

function createEL(name,methods){
    var el = document.createElement(name)
    if(methods.children){
        methods.children.forEach(function(child){
            el.appendChild(child)
        })
        delete methods.children
    }
    for(key in methods){
        el[key] = methods[key]
    }
    return el;
}
function createDiv(methods){
    return createEL("div",methods)
}
function createSpan(methods){
    return createEL("span",methods)
}
class ScriptButton{
    constructor(){

    }
    render(){
        var el = createDiv({
            className: "game_script_box",
            children: [
                createSpan({
                    className: "script_box_button script_box_edit_button",
                    innerText: "Edit",
                }),
                createSpan({
                    innerText:"   ",
                }),
                createSpan({
                    className: "script_box_button script_box_delete_button",
                    innerText: "Delete",
                })
            ]
        })
        return el;
    }
}

function init_single_player(){
    var button = new MenuButton()
    document.getElementById("single_page_game_overlay").appendChild(button.render())
}

module.exports = {
    switch_to_single_player: switch_to_single_player,
    init_single_player: init_single_player,
}
