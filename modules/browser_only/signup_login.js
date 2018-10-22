var $ = require('jquery');
var url_info = require("./url_info.js")

function uint_to_hex(uint_array){
    var res = ""
    for(var i = 0; i < uint_array.length; i++){
        res += uint_array[i].toString(36)
    }
    return res
}
function generate_random_string(){
    var array = new Uint32Array(3);
    window.crypto.getRandomValues(array);
    return uint_to_hex(array)
}
function username_sumbitted(password,response){
    if(response.type === "registration_error"){
        $("#username_error").text(response.error_message)
        $("#submit_username").prop('disabled', false);
    }
    else if(response.type === "registration_success"){
        $("#username_error").text("")
        $("#password_reveal").show()
        $("#password_register_reveal").text(password)
    }
    else{
        console.log("bad server response!")
    }
}
function switch_to_signup(){
    $(".page_level").hide()
    $("#signup_page").show()
    $("#password_reveal").hide()
    $("#username_error").text("")
    $("#submit_username").prop('disabled', false);
}
function init_signup_login(){
    $("#submit_username").click(function(){
        var generated_password = generate_random_string()
        $("#submit_username").prop('disabled', true);
        var username_summitted = $("#username_register_input").val()
        var data = {
            "type": "username_submission",
            "username": username_summitted,
            "password": generated_password,
        }
        var full_url = "http://"+url_info.user_server_url + ":" + url_info.user_server_port + "/register_user"
        $.ajax(full_url,
            {
                accepts: 'application/json',
                dataType: "json",
                type: 'post',
                crossDomain: true,
                data: JSON.stringify(data),
                processData: false,
                success: function(data){
                    console.log(data)
                    username_sumbitted(generated_password,data)
                },
                error: function(jqXhr, textStatus, errorThrown ){
                    console.log(errorThrown)
                }
            }
        )
    })
}
//console.log(generate_random_string())

module.exports = {
    init_signup_login: init_signup_login,
    switch_to_signup: switch_to_signup,
}
