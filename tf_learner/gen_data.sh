JSON_MODEL=/tmp/json_model
MODEL_NAME=$1
NPY_MODEL=$2
[ $MODEL_NAME ] || exit
[ $NPY_MODEL ] || exit
mkdir -p $JSON_MODEL
(cd ../modules; node train_batch_generator.js $MODEL_NAME $JSON_MODEL)
python json_to_npy.py $JSON_MODEL $NPY_MODEL
