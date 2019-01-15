import json
import numpy
import argparse
import os


def json_to_npy(json_fname,npy_fname):
    json_data = json.load(open(json_fname))
    npy_data = numpy.asarray(json_data,dtype=numpy.float32)
    numpy.save(npy_fname,npy_data)

def json_folder_to_npy_folder(json_folder,npy_folder):
    if not os.path.exists(npy_folder):
        os.makedirs(npy_folder)
    fnames = os.listdir(json_folder)
    for fname in fnames:
        json_to_npy(os.path.join(json_folder,fname),os.path.join(npy_folder,fname+".npy"))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Turn a folder full of .json files into a folder of .npy vector files")
    parser.add_argument('json_folder', help='Path to folder full of .json.')
    parser.add_argument('npy_folder', help='Path to output folder to fill with .npy.')

    args = parser.parse_args()
    json_folder_to_npy_folder(args.json_folder,args.npy_folder)
