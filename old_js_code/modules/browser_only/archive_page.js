var url_info = require("./url_info.js")
var login_info = require("./signup_login.js")
var basecomp = require("./game_display/base_component.js")
//var page_navigation = require("./game_display/base_component.js")
var AnalysisUI = require("./analysis_ui.js").AnalysisUI

var createEL = basecomp.createEL
var createDiv = basecomp.createDiv
var createSpan = basecomp.createSpan

function get_id_json(id,callback){
    var url = "/game_records/"+id+".json"
    $.ajax({
      dataType: "json",
      url: url,
      data: "",
      success: callback,
      error: function(){
          alert("cannot find game record with id: "+id)
      },
    });
}
function link_clicked(id){
    get_id_json(id,function(record){
        console.log(record)
        var x = new AnalysisUI(record,document.getElementById("analysis_basediv"))
    })
}

function create_table(archive_data){
    var table_body = document.getElementById("archive-body")
    table_body.innerHTML = ""
    archive_data.sort((d)=>d.date)
    console.log(archive_data)
    archive_data.forEach(function(game_data){
        var row = createEL("tr",{
            children:[
                createEL('td',{
                    innerText: game_data.date,
                }),
                createEL('td',{
                    innerText: game_data.result,
                }),
                createEL('td',{
                    children:[
                        createSpan({
                            innerHTML: game_data.record_id,
                            className: "archive_link",
                            onclick: function(){
                                console.log("clicked!!!")
                                return link_clicked(game_data.record_id)
                            }
                        })
                    ]
                })
            ]
        })
        table_body.appendChild(row)
    })
}

function make_draggable_div(){
    var dragging = false;
    $("#archive_width_control").mousedown(function(){
        dragging = true;
    })
    $(document.body).mouseup(function(){
        dragging = false;
    })
    $(document.body).mouseleave(function(){
        dragging = false;
    })
    $(document.body).mousemove(function(event){
        if(dragging){
            var xval = event.clientX
            var body_size = $(document.body).width()
            var percent = xval / body_size
            if (percent < 0.1){
                percent = 0.1
            }
            if (percent > 0.9){
                percent = 0.9
            }
            document.getElementById('archive_table_div').style.right = (1.0-percent)*100 + "%"
            document.getElementById('analysis_basediv').style.left = percent*100 + "%"

            var bar_width_off = 20 / body_size/2;
            var el = document.getElementById('archive_width_control')
            el.style.left = (percent-bar_width_off)*100 + "%"
            el.style.right = "auto"
        }
    })
}
function init_archive(){
    make_draggable_div()
    refresh_archive()
}
function switch_to_archive(){
    $(".page_level").hide()
    $("#archive_page").show()
    refresh_archive()
}
function refresh_archive(){
    if(login_info.is_logged_in()) {
        //add_button(row,request_button())
        var creds = login_info.get_credentials()

        var full_url = url_info.user_server_full_url + "/game_archive"
        $.ajax(full_url,
            {
                accepts: 'application/json',
                type: 'get',
                crossDomain: true,
                data: creds,
                success: function(data){
                    console.log(data)
                    data = JSON.parse(data)
                    if(data.type === "success"){
                        console.log(data.data)
                        create_table(data.data)
                    }
                    else{
                        console.log(data)
                    }
                },
                error: function(jqXhr, textStatus, errorThrown ){
                    console.log(errorThrown)
                }
            })
    }
}
module.exports = {
    switch_to_archive: switch_to_archive,
    init_archive: init_archive,
}
