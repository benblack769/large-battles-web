var url_info = require("./url_info.js")

function init_rankings(){
    refresh_rankings()
}
function switch_to_rankings(){
    $(".page_level").hide()
    $("#rankings_page").show()
    refresh_rankings()
}
function display_rankings(data){
    $('#my-final-table').dynatable({
      dataset: {
        records: JSON.parse(data)
      }
    })
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
