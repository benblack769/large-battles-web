

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
    return createEL("div", methods)
}
function createSpan(methods){
    return createEL("span", methods)
}
function make_change_script_popup(current_value, verifier, callback){
    $("#global_text_popup").show()
    $("#text_edit_textarea").val(current_value)

    $("#text_edit_ok_button").click(function(){
        $("#text_edit_error_textarea").val("")
        try{
            var value = $("#text_edit_textarea").val();
            var parsed_val = verifier(value)
            callback(parsed_val)
            $("#global_text_popup").hide()
        }
        catch(e){
            $("#text_edit_error_textarea").val("ERROR: "+e.message)
        }
    })
    $("#text_edit_cancel_button").click(function(){
        $("#global_text_popup").hide()
    })
}
class ScriptButton{
    constructor(){
        this.state = {
            data: {},
            selected: false,
            editing: false,
        }
        this.should_render = true
    }
    changeState(newstate){
        this.state = newstate
        this.should_render = true
    }
    shouldRender(){
        return this.should_render
    }
    selectScript(){
        console.log("selected")
        this.changeState(Object.assign({selected:true},this.state))
    }

    render(){
        this.should_render = false
        var myChildren = !this.editing ? [] :  [
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
        var el = createDiv({
            className: "game_script_box",
            onclick: this.selectScript.bind(this),
            children: myChildren,
        })
        return el;
    }
}

function init_single_player(){
    var button = new ScriptButton()
    document.getElementById("single_page_game_overlay").appendChild(button.render())

    /*var obj = JSON.stringify({
        hithere: 123,
        bob: "green"
    },null,4)
    make_change_script_popup(obj,JSON.parse,function(res_val){
        console.log(res_val)
    })*/
}

module.exports = {
    switch_to_single_player: switch_to_single_player,
    init_single_player: init_single_player,
}
