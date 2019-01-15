var fs = require('fs')
var MajorCoordLearnStreamer = require("./logic_modules/ai_interface/major_coord_learner.js").MajorCoordLearnStreamer

console.assert(process.argv.length === 3, "needs 1 command line arguments, output_folder")

const output_folder = process.argv[2]


const data_batch_size = 512;
const num_data_batches = 40;

var records = [
    JSON.parse(fs.readFileSync("../game_records/fixed_large_record.json")),
    JSON.parse(fs.readFileSync("../game_records/second_large_record.json")),
]
var myplayer_name = "chromeuser";

var learn_streamer = new MajorCoordLearnStreamer(records,myplayer_name)

function make_if_not_exists(dir){
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    else{
        fs.readdirSync(dir).forEach(function(file, index){
          var curPath = dir + "/" + file;
          fs.unlinkSync(curPath);
        })
    }
}
function save_data(info,fname){
    let data = JSON.stringify(info);
    fs.writeFileSync(fname, data);
}
function get_major_data(){
    var batch_data = learn_streamer.get_data_batch(data_batch_size)
    return batch_data
}
function save_all_data(){
    make_if_not_exists(output_folder)
    for(var batch = 0; batch < num_data_batches; batch++){
        var input_fname = output_folder+"/"+"input"+batch+".json"
        var output_fname = output_folder+"/"+"output"+batch+".json"
        var ins_outs = get_major_data()
        save_data(ins_outs.inputs,input_fname)
        save_data(ins_outs.outputs,output_fname)
    }
}
save_all_data()
