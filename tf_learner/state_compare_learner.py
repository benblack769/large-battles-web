import numpy as np
import tensorflow as tf
import argparse
import random
import os
import shutil

def global_average_pool(map4d):
    shape_list = map4d.get_shape().as_list()
    batch_size = tf.shape(map4d)[0]
    map_flattened = tf.reshape(map4d,[batch_size,shape_list[1]*shape_list[2],shape_list[3]])
    return tf.reduce_mean(map_flattened,axis=1)

def lay_pool_skip_method(input):
    lay1size = 64
    CONV1_SIZE=[3,3]
    POOL_SIZE=[2,2]
    POOL_STRIDES=[2,2]
    DEPTH=3
    basic_outs = []
    orig_reduction = tf.layers.dense(
        inputs=input,
        units=lay1size,
    )
    orig_reduction = tf.layers.dense(
        inputs=orig_reduction,
        units=lay1size,
    )
    tot_out = global_average_pool(orig_reduction)

    cur_out = orig_reduction
    for x in range(DEPTH):
        lay1_outs = tf.layers.conv2d(
            inputs=cur_out,
            filters=lay1size,
            kernel_size=CONV1_SIZE,
            padding="same",
            use_bias=True,
            activation=tf.nn.relu)
        lay1_outs = tf.layers.conv2d(
            inputs=lay1_outs,
            filters=lay1size,
            kernel_size=CONV1_SIZE,
            padding="same",
            use_bias=True,
            activation=tf.nn.relu)
        lay_1_pool = tf.layers.max_pooling2d(
            inputs=lay1_outs,
            pool_size=POOL_SIZE,
            strides=POOL_STRIDES,
            padding='same',
        )
        tot_out = tot_out + global_average_pool(lay1_outs)
        basic_outs.append(lay1_outs)
        cur_out = lay_1_pool
        #print(lay_1_pool.shape)
    flattened_deepest_out = tf.layers.flatten(cur_out)
    fc_layer = tf.layers.dense(
        inputs=flattened_deepest_out,
        units=lay1size
    )
    tot_out = tot_out + fc_layer
    refine_layer1 = tf.layers.dense(
        use_bias=True,
        inputs=fc_layer,
        units=lay1size
    )
    refine_layer3 = tf.layers.dense(
        inputs=refine_layer1,
        units=1
    )
    '''
    old_val = basic_outs[DEPTH-1]
    for y in range(DEPTH-2,-1,-1):
        skip_val = basic_outs[y]
        depooled = unpool2x2(old_val,skip_val.get_shape().as_list())
        base_val = depooled + skip_val

        old_val = tf.layers.conv2d(
            inputs=base_val,
            filters=lay1size,
            kernel_size=CONV1_SIZE,
            padding="same",
            activation=tf.nn.relu)

        #old_val = base_val
        #print(depooled.shape,)


    combined_input = old_val+orig_reduction
    refine_layer1 = tf.layers.dense(
        inputs=combined_input,
        units=lay1size
    )
    refine_layer3 = tf.layers.dense(
        inputs=refine_layer1,
        units=1
    )'''
    return refine_layer3


def make_model(input):
    lay1size = 32
    CONV1_SIZE=[3,3]
    POOL_SIZE=[2,2]
    POOL_STRIDES=[1,2,2,1]

    out = lay_pool_skip_method(input)

    print(out.shape)
    flattened = tf.layers.flatten(out)
    #lay4_outs = lay4_outs * 0.1
    print("flattened.shape")
    print(flattened.shape)
    summed = tf.reduce_mean(flattened,axis=1)
    print(summed.shape)
    return summed
    #const optimizer = tf.train.rmsprop(0.01);

def get_batch_data(input_folder):
    fnames = os.listdir(input_folder)
    input_names = [f for f in fnames if "input" in f]
    input_choice = random.choice(input_names[1:])
    output_choice = "output"+input_choice[5:]
    return (np.load(os.path.join(input_folder,input_choice)),np.load(os.path.join(input_folder,output_choice)))

def model_loss(act_outputs,model_outputs):
    cross_entropy = tf.nn.sigmoid_cross_entropy_with_logits(labels=act_outputs,logits=model_outputs)
    return tf.reduce_mean(cross_entropy)

def rework_input(input):
    base_shape = input.get_shape().as_list()
    batch_size = tf.shape(input)[0]
    part1 = tf.slice(input,[0,0,0,0],[batch_size,base_shape[1],base_shape[2],base_shape[3]//2])
    part2 = tf.slice(input,[0,0,0,base_shape[3]//2],[batch_size,base_shape[1],base_shape[2],base_shape[3]//2])
    reworked = part1 - part2
    return tf.concat([reworked,input],axis=3)

def learn_on_data(train_folder,export_path):
    current_inputs,current_outputs = get_batch_data(train_folder)
    BATCH_SIZE = 16
    NUM_TRAIN_ITERS = 500
    BATCHES_PER_DATA = current_inputs.shape[0] // BATCH_SIZE
    #print("BATCHES_PER_DATA",BATCHES_PER_DATA)

    input = tf.placeholder(tf.float32, (None,)+ current_inputs.shape[1:],name="input")
    act_output = tf.placeholder(tf.float32, (None,)+ current_outputs.shape[1:])
    #act_output_reshape = tf.reshape(act_output,(None,)+ current_outputs.shape[1:]+(1,))
    #print(current_outputs)
    model_output = make_model(rework_input(input))
    sig_out = tf.nn.sigmoid(model_output,name="sig_out")

    loss = model_loss(act_output,model_output)
    optimizer = tf.train.AdamOptimizer(0.001)
    optim = optimizer.minimize(loss)


    test_input = np.load(os.path.join(train_folder,"input0.json.npy"))
    test_output = np.load(os.path.join(train_folder,"output0.json.npy"))

    with tf.Session() as sess:
        sess.run(tf.global_variables_initializer())
        for x in range(NUM_TRAIN_ITERS):
            tot_loss = 0
            for idx in range(BATCHES_PER_DATA):
                opt_val,loss_val = sess.run([optim,loss],feed_dict={
                    input: current_inputs[BATCH_SIZE*idx:BATCH_SIZE*(idx+1)],
                    act_output: current_outputs[BATCH_SIZE*idx:BATCH_SIZE*(idx+1)],
                })
                #print(model_val)
                tot_loss += loss_val
                #print(tot_loss/BATCHES_PER_DATA)
            print("train loss ",tot_loss/BATCHES_PER_DATA)
            #print(tot_loss/BATCHES_PER_DATA)
            current_inputs,current_outputs = get_batch_data(train_folder)

            if x % 10 == 0:
                tot_loss = 0
                for idx in range(BATCHES_PER_DATA):
                    loss_val = sess.run(loss,feed_dict={
                        input: test_input[BATCH_SIZE*idx:BATCH_SIZE*(idx+1)],
                        act_output: test_output[BATCH_SIZE*idx:BATCH_SIZE*(idx+1)],
                    })
                    #print(model_val)
                    tot_loss += loss_val
                    #print(tot_loss/BATCHES_PER_DATA)
                print("test loss ",tot_loss/BATCHES_PER_DATA)

        tf.saved_model.simple_save(
            sess, export_path, {"input": input},{"sig_out":sig_out}
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="")
    parser.add_argument('batch_data', help='Path to folder full of .npy inputs and outputs to learn from.')
    parser.add_argument('export_path', help='Path to destination of tensor graph.')

    args = parser.parse_args()
    if os.path.exists(args.export_path):
        shutil.rmtree(args.export_path)
    learn_on_data(args.batch_data,args.export_path)
