/*
Makes emscripten js file load wasm module via base64 encoding in html, rather than downloaded link

see https://kripken.github.io/emscripten-site/docs/api_reference/module.html for reference docs

*/


var Module = {
    instantiateWasm: function(imports,callback){
        console.log(imports)
        var base64 = document.getElementById("web_assembly_code").innerHTML
        var bytes = Uint8Array.from(atob(base64),c=>c.charCodeAt(0))
        //WebAssembly.instantiate()
        WebAssembly.instantiate(bytes,imports).then(results=>{
            //console.log(results.instance.exports.add(92,23))
            callback(results.instance)
        })
        return {}
    }
}
