
function saveFile (name, type, data) {
    if (data != null && navigator.msSaveBlob)
        return navigator.msSaveBlob(new Blob([data], { type: type }), name);
    var a = $("<a style='display: none;'/>");
    var url = window.URL.createObjectURL(new Blob([data], {type: type}));
    a.attr("href", url);
    a.attr("download", name);
    $("body").append(a);
    a[0].click();
    window.URL.revokeObjectURL(url);
    a.remove();
}

function replace_images(){
    var canvas = document.createElement("canvas");
    document.body.appendChild(canvas)
    context = canvas.getContext('2d');
    $("img").each(function(idx, element){
        canvas.width = element.naturalWidth
        canvas.height = element.naturalHeight
        context.drawImage(element, 0, 0);
        var pngUrl = canvas.toDataURL("image/png");
        element.src = pngUrl
    })
    $(canvas).remove()
}
function replace_css_links(){
    var num_links = 0;
    var num_downloads = 0;
    var all_data = {}
    $("link").each(function(idx,element){
        if(element.rel === "stylesheet" && element.type === "text/css"){
            num_links++;
            $.get(element.href,function(data){
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
            },"text")
        }
    })
}

function replace_script_links(){
    $("script").each(function(idx, element){
        if(element.src.includes("htmlify.js")){
            element.removeAttribute("src")
        }
        else if(element.src){
            $.get(element.src, function(data){
                element.removeAttribute("src")
                element.innerHTML = data
            },"text")
        }
    })
}
window.onload = function(){
    replace_css_links()
    replace_script_links()
    setTimeout(function(){
        replace_images()
        saveFile("site.html", "data:attachment/text", document.documentElement.outerHTML );
    },2000)
}
