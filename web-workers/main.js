if (typeof(Worker) !== "undefined") {
    // Yes! Web worker support!
    // Some code.....
    var w = new Worker("demo_workers.js");
    w.onmessage = function(event){
        document.getElementById("result").innerHTML = event.data;
    };
    w.terminate();
} else {
    // Sorry! No Web Worker support..
}
