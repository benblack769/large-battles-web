import os
import random
import numpy as np
import tensorflow as tf

SHUFFLE_BUFFER_SIZE = 2048
TRAIN_BATCH_SIZE = 32

def get_batch_data(input_folder):
    fnames = os.listdir(input_folder)
    input_names = [f for f in fnames if "input" in f]
    input_choice = random.choice(input_names[1:])
    output_choice = "output"+input_choice[5:]
    return (np.load(os.path.join(input_folder,input_choice)),np.load(os.path.join(input_folder,output_choice)))

def file_generator(folder):
    fnames = os.listdir(folder)
    input_fnames = [f for f in fnames if "input" in f]
    use_input_fnames = [name for name in input_fnames if "input0" not in name]
    while True:
        input_choice = random.choice(use_input_fnames)
        output_choice = "output"+input_choice[5:]
        np_input_data = np.load(os.path.join(folder,input_choice))
        np_output_data = np.load(os.path.join(folder,output_choice))
        for x in range(np_input_data.shape[0]):
            yield np_input_data[x],np_output_data[x]

def make_file_generator(folder):
    fnames = os.listdir(folder)
    input_fnames = [f for f in fnames if "input" in f]
    use_input_fnames = [name for name in input_fnames if "input0" not in name]
    def file_generator():
        while True:
            input_choice = random.choice(use_input_fnames)
            output_choice = "output"+input_choice[5:]
            np_input_data = np.load(os.path.join(folder,input_choice))
            np_output_data = np.load(os.path.join(folder,output_choice))
            for x in range(np_input_data.shape[0]):
                yield np_input_data[x],np_output_data[x]
    return file_generator


def shuffle_buffer_generator(data_generator,buffer_size):
    buffer = []
    #rand_buffer_size = 1000
    ##rand_buffer_size = 1000
    #rand_int_buffer = np.random.randint(0,buffer_size,rand_buffer_size)
    for x in range(buffer_size):
        buffer.append(next(data_generator))
    #rand_idx = 0
    while True:
        rand_buf_idx = random.randrange(0,buffer_size)#int(rand_int_buffer[rand_idx])
        samp_val = buffer[rand_buf_idx]
        buffer[rand_buf_idx] = next(data_generator)
        yield samp_val
        #rand_idx += 1
        #if rand_idx == rand_buffer_size:
        #    rand_int_buffer = np.random.randint(0,buffer_size,rand_buffer_size)
        #    rand_idx = 0

def batch_generator(data_generator,batch_size):
    while True:
        ins_outs = [next(data_generator) for _ in range(batch_size)]
        inputs = np.stack([in_out[0] for in_out in ins_outs])
        outputs = np.stack([in_out[1] for in_out in ins_outs])
        yield inputs,outputs

def get_np_input_stream(folder):
    file_gen = file_generator(folder)
    shuffle_gen = shuffle_buffer_generator(file_gen,SHUFFLE_BUFFER_SIZE)
    batch_gen = batch_generator(shuffle_gen,TRAIN_BATCH_SIZE)
    return batch_gen

def get_input_stream(folder):
    input_shape = np.load(os.path.join(folder,"input0.json.npy")).shape
    output_shape = np.load(os.path.join(folder,"output0.json.npy")).shape
    actual_generator = make_file_generator(folder)
    ds = tf.data.Dataset.from_generator(
        actual_generator, (tf.float32,tf.float32), (tf.TensorShape(input_shape[1:]),tf.TensorShape(output_shape[1:])))
    #ds1 = tf.data.Dataset.from_tensor_slices([tf.constant(data[0]) for data in all_data])
    #ds2 = tf.data.Dataset.from_tensors([tf.constant(data[1]) for data in all_data])
    #ds3 = tf.data.Dataset.from_tensors([tf.constant(data[2]) for data in all_data])
    #ds = tf.data.Dataset.zip([ds1,ds2,ds3])
    ds = ds.shuffle(SHUFFLE_BUFFER_SIZE)
    ds = ds.batch(TRAIN_BATCH_SIZE)
    ds = ds.prefetch(4)
    iter = ds.make_one_shot_iterator()
    input,act_output = iter.get_next()
    return input,act_output
