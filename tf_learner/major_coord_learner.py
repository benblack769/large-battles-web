import numpy as np
import tensorflow as tf
import argparse
import random
import os

def make_model(input):
    lay1size = 32
    CONV1_SIZE=3

    lay1_outs = tf.layers.conv2d(
        inputs=input,
        filters=lay1size,
        kernel_size=[CONV1_SIZE, CONV1_SIZE],
        padding="same",
        activation=tf.nn.relu)
    lay2_outs = tf.layers.conv2d(
        inputs=lay1_outs,
        filters=lay1size,
        kernel_size=[CONV1_SIZE, CONV1_SIZE],
        padding="same",
        activation=tf.nn.relu)
    lay3_outs = tf.layers.conv2d(
        inputs=lay2_outs,
        filters=lay1size,
        kernel_size=[CONV1_SIZE, CONV1_SIZE],
        padding="same",
        activation=tf.nn.relu)
    lay4_outs = tf.layers.conv2d(
        inputs=lay3_outs,
        filters=1,
        kernel_size=[1, 1],
        padding="same",
        activation=None)
    lay4_outs = lay4_outs * 0.1
    return tf.squeeze(lay4_outs)
    #const optimizer = tf.train.rmsprop(0.01);

def get_batch_data(input_folder):
    fnames = os.listdir(input_folder)
    input_names = [f for f in fnames if "input" in f]
    input_choice = random.choice(input_names)
    output_choice = "output"+input_choice[5:]
    return (np.load(os.path.join(input_folder,input_choice)),np.load(os.path.join(input_folder,output_choice)))

def model_loss(act_outputs,model_outputs):
    cross_entropy = tf.nn.sigmoid_cross_entropy_with_logits(labels=act_outputs,logits=model_outputs)
    model_pred = tf.nn.sigmoid(model_outputs)
    output_weights = tf.abs(model_pred - act_outputs)
    weighted_map = output_weights * cross_entropy
    return tf.reduce_mean(weighted_map)


def learn_on_data(train_folder,export_path):
    current_inputs,current_outputs = get_batch_data(train_folder)
    BATCH_SIZE = 16
    NUM_TRAIN_ITERS = 30
    BATCHES_PER_DATA = current_inputs.shape[0] // BATCH_SIZE
    #print("BATCHES_PER_DATA",BATCHES_PER_DATA)

    input = tf.placeholder(tf.float32, (None,)+ current_inputs.shape[1:],name="input")
    act_output = tf.placeholder(tf.float32, (None,)+ current_outputs.shape[1:])
    #act_output_reshape = tf.reshape(act_output,(None,)+ current_outputs.shape[1:]+(1,))

    model_output = make_model(input)
    sig_out = tf.nn.sigmoid(model_output,name="sig_out")

    loss = model_loss(act_output,model_output)
    optimizer = tf.train.RMSPropOptimizer(0.001)
    optim = optimizer.minimize(loss)



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
            print(tot_loss/BATCHES_PER_DATA)
            #print(tot_loss/BATCHES_PER_DATA)
            current_inputs,current_outputs = get_batch_data(train_folder)

        tf.saved_model.simple_save(
            sess, export_path, {"input": input},{"sig_out":sig_out}
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="")
    parser.add_argument('batch_data', help='Path to folder full of .npy inputs and outputs to learn from.')
    parser.add_argument('export_path', help='Path to destination of tensor graph.')

    args = parser.parse_args()
    learn_on_data(args.batch_data,args.export_path)
