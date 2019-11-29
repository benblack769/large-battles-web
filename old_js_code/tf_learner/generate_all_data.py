import subprocess
import argparse
import shutil
import os
import multiprocessing
import sys



NUM_DATAS = 100

def gen_all_ins_outs(folder,constructor_name):
    arg_ll  = []
    for i in range(NUM_DATAS):
        in_name = os.path.join(folder,"input"+str(i)+".npy.gz")
        out_name = os.path.join(folder,"output"+str(i)+".npy.gz")
        arg_ll.append(["node","train_batch_generator.js",constructor_name,in_name,out_name])
    return arg_ll

def exec_procs(args):
    proc_list = []
    for arg in args:
        proc_list.append(subprocess.Popen(arg,cwd="../modules/",stdout=sys.stdout,stderr=sys.stdout))
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
    args = gen_all_ins_outs(args.out_folder,"state_compare")
    execute_parellel(args)
