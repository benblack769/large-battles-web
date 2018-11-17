const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");
var src_folder = process.argv[2]
const data = fs.readFileSync(src_folder+"index.html", "utf-8");
const Datauri = require('datauri');
const dom = new JSDOM(data);
const document = dom.window.document
const $ = require("jquery")(dom.window)

function saveFile (name, type, data) {
    console.log(data)
}
function replace_images(){
    $("img").each(function(idx, element){
        var pngUrl = new Datauri(src_folder+element.src)
        element.src = pngUrl.content
    })
}
function on_get_text(url, on_process){
    if(url.includes("http")){
        $.get(url,on_process,"text")
    }
    else{
        on_process(fs.readFileSync(src_folder+url, "utf-8"))
    }
}
function replace_css_links(){
    var num_links = 0;
    var num_downloads = 0;
    var all_data = {}
    $("link").each(function(idx,element){
        if(element.rel === "stylesheet" && element.type === "text/css"){
            num_links++;
            on_get_text(element.href,function(data){
                $(element).remove()
                num_downloads++;
                all_data[idx] = data
                if(num_downloads === num_links){
                    var tot_data = ""
                    for(var i = 0; i < num_links; i++){
                        tot_data += all_data[i]
                    }
                    var main_style = document.createElement("style")
                    main_style.innerHTML = tot_data
                    document.head.appendChild(main_style)
                }
            })
        }
    })
}

function replace_script_links(){
    $("script").each(function(idx, element){
        if(element.src.includes("htmlify.js")){
            element.removeAttribute("src")
        }
        else if(element.src){
            on_get_text(element.src, function(data){
                element.removeAttribute("src")
                element.innerHTML = data
            })
        }
    })
}
//window.onload = function(){
    replace_css_links()
    replace_script_links()
    setTimeout(function(){
        replace_images()
        saveFile("site.html", "data:attachment/text", document.documentElement.outerHTML );
    },2000)
//}
