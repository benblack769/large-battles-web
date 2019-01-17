import json
import numpy
import sys

assert len(sys.argv) == 2,"needs 1 argument, output filename"

fname = sys.argv[1]

json_data = json.loads(sys.stdin.read())
npy_data = numpy.asarray(json_data,dtype=numpy.int8)
numpy.save(fname,npy_data)
