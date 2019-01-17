import subprocess
import argparse
import shutil
import os
import multiprocessing



NUM_DATAS = 200

def gen_all_ins_outs(constructor_name):
    arg_ll  = []
    for i in range(NUM_DATAS):
        in_name = "input"+str(i)+".json.npy"
        out_name = "output"+str(i)+".json.npy"
        arg_ll.append(["node","train_batch_generator.js",constructor_name,in_name,out_name])
    return arg_ll

def exec_procs(args):
    proc_list = []
    for arg in args:
        proc_list.append(subprocess.Popen(arg,cwd="../modules/"))
    for proc in proc_list:
        proc.wait()

def execute_parellel(arg_lists):
    CPU_COUNT = multiprocessing.cpu_count()
    rlist = list(range(0,len(arg_lists)-CPU_COUNT,CPU_COUNT))
    for x in rlist:
        exec_procs(arg_lists[x:x+CPU_COUNT])

    exec_procs(arg_lists[rlist[-1]:])



if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="")
    parser.add_argument('out_folder', help='Path to output folder.')

    args = parser.parse_args()
    if os.path.exists(args.out_folder):
        shutil.rmtree(args.out_folder)
    os.mkdir(args.out_folder)
    args = gen_all_ins_outs("state_compare")
    execute_parellel(args)
