
function make_change_script_popup(current_value, verifier, callback){
    $("#global_text_popup").show()
    $("#text_edit_textarea").val(current_value)
    $("#text_edit_error_textarea").val("")

    $("#text_edit_ok_button").click(function(){
        $("#text_edit_error_textarea").val("")
        try{
            var value = $("#text_edit_textarea").val();
            var parsed_val = verifier(value)
            callback(value)
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
module.exports = {
    make_change_script_popup: make_change_script_popup,
}
