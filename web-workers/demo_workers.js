importScripts('foo.js');

//var i = 0;

function timedCount() {
    i = eval("i + 1");
    postMessage(i);
    setTimeout("timedCount()",100);
}
this.onmessage = function(message){
    console.log(message)
}

timedCount();
