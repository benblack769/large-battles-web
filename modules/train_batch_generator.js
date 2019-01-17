var fs = require('fs')
var child_process = require('child_process');
var MajorCoordLearnStreamer = require("./logic_modules/ai_interface/major_coord_learner.js").MajorCoordLearnStreamer
var StateCompareLearnStreamer = require("./logic_modules/ai_interface/state_comparitor.js").StateCompareLearnStreamer

console.assert(process.argv.length === 5, "needs 3 command line argument: model_constructor,input_fname,output_fname")

const model_name = process.argv[2]
const input_fname = process.argv[3]
const output_fname = process.argv[4]

const model_constructor_mapper = {
    "major_coord":MajorCoordLearnStreamer,
    "state_compare": StateCompareLearnStreamer,
}
const model_constructor = model_constructor_mapper[model_name]

const data_batch_size = 512;

var records = [
    JSON.parse(fs.readFileSync("../game_records/fixed_large_record.json")),
    JSON.parse(fs.readFileSync("../game_records/second_large_record.json")),
]
var myplayer_name = "chromeuser";

var learn_streamer = new model_constructor(records,myplayer_name)

var batch_data = learn_streamer.get_data_batch(data_batch_size)

var in_data = JSON.stringify(batch_data.inputs)
var out_data = JSON.stringify(batch_data.outputs)
var py_out = child_process.spawnSync("python",["../tf_learner/json_to_npy.py",input_fname],{
    input:in_data,
})
process.stdout.write(py_out.stdout)
process.stderr.write(py_out.stderr)
var py_out = child_process.spawnSync("python",["../tf_learner/json_to_npy.py",output_fname],{
    input:out_data,
})
process.stdout.write(py_out.stdout)
process.stderr.write(py_out.stderr)
