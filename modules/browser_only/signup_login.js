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
        set_username(response.username,password)
        login_display()
    }
    else{
        console.log("bad server response!")
    }
}
function login_display(){
    var username = localStorage.getItem("username")
    $("#signup_login").hide()
    $("#login_display").show()
    $("#username_navbar_display").text(username)
}
function switch_to_signup(){
    $(".page_level").hide()
    $("#signup_page").show()
    $("#password_reveal").hide()
    $("#username_error").text("")
    $("#submit_username").prop('disabled', false);
}
function switch_to_login(){
    $(".page_level").hide()
    $("#login_page").show()
    $("#submit_login").prop('disabled', false);
    $("#login_error").text("")
}
function logout(){
    localStorage.removeItem("username")
    localStorage.removeItem("password")
    $("#signup_login").show()
    $("#login_display").hide()
}
function set_username(username, password){
    localStorage.setItem("password",password)
    localStorage.setItem("username",username)
}
function login_submitted(response){
    if(response.type === "login_error"){
        $("#submit_login").prop('disabled', false);
        $("#login_error").text(response.error_message)
    }
    else if(response.type === "login_success"){
        set_username(response.username,response.password)
        login_display()
    }
    else{
        console.log("bad response from server")
    }
}
function init_signup_login(){
    if(!(localStorage.getItem("username") === null)){
        login_display()
    }
    $("#submit_username").click(function(){
        var generated_password = generate_random_string()
        $("#submit_username").prop('disabled', true);
        var username_summitted = $("#username_register_input").val()
        var data = {
            "type": "username_submission",
            "username": username_summitted,
            "password": generated_password,
        }
        var full_url = url_info.user_server_full_url + "/register_user"
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
    $("#submit_login").click(function(){
        $("#submit_login").prop('disabled', true);
        var data = {
            "type": "username_verification",
            "username": $("#username_login_input").val(),
            "password": $("#password_login_input").val(),
        }
        var full_url = url_info.user_server_full_url + "/verify_user"
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
                    login_submitted(data)
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
    switch_to_login: switch_to_login,
    logout: logout,
}
