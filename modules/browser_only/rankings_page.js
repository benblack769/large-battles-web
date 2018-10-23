var url_info = require("./url_info.js")

function init_rankings(){
    refresh_rankings()
}
/*function make_row(entry){
    var row = document.createElement("tr")

}*/
function switch_to_rankings(){
    $(".page_level").hide()
    $("#rankings_page").show()
}
function display_rankings(data){
    $('#my-final-table').dynatable({
      dataset: {
        records: JSON.parse(data)
      }
    })
    /*
    var rankings = data.user_list
    var table = document.getElementById("top_rankings_table").cloneNode(true)
    table.style.display = "block"
    document.getElementById("table_container").appendChild(table)

    for(var i = 0; i < rankings.length; i++){
        table.appendChild(make_row(data[i]))
    }*/
}
function refresh_rankings(){
    var full_url = url_info.user_server_full_url + "/rank_users"
    $.ajax(full_url,
        {
            accepts: 'application/json',
            type: 'get',
            crossDomain: true,
            success: function(data){
                console.log(data)
                display_rankings(data)
            },
            error: function(jqXhr, textStatus, errorThrown ){
                console.log(errorThrown)
            }
        })
}
module.exports = {
    switch_to_rankings: switch_to_rankings,
    init_rankings: init_rankings,
}
