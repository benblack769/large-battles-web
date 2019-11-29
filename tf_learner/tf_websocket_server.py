import logging
from collections import defaultdict
from websocket_server import WebsocketServer
import numpy as np
import base64
import json

class ExecQueue:
    def __init__(self, batch_size, exec_fn, return_fn):
        self.batch_size = batch_size
        self.exec_fn = exec_fn
        self.return_fn = return_fn
        self.tasks = []

    def add_task(self,source_id,data):
        self.tasks.push((source_id,data))
        if len(self.tasks) == self.batch_size:
            sources = [t[0] for t in self.tasks]
            datas = [t[1] for t in self.tasks]
            outputs = self.exec_fn(datas)
            for source,output in zip(sources,outputs):
                self.return_fn(source, output)

def to_str(nparr):
    return json.dumps({
        "shape": nparr.shape,
        "data": base64.b64encode(nparr.tobytes()).decode("utf-8")
    })

def from_str(arrstr):
    data = json.loads(arrstr)
    shape = data['shape']
    bin_data = np.fromstring(base64.b64decode(data['data']),dtype=np.float32)
    reshaped_bin_data = np.reshape(bin_data,shape)
    return reshaped_bin_data

#arr = from_str(to_str(np.arange(100,dtype=np.float32).reshape((5,20))))
#print(arr)
#exit(0)

#def new_client(client, server):
#	server.send_message_to_all("Hey all, a new client has joined us")

valid_queue_names = [
    "main_coord",
    "comparitor",
]

batch_size = 32
def exec_fn_test(datas):
    print("exec")

def return_fn_test(datas):
    print("returns")

model_queues = {name: ExecQueue(batch_size,exec_fn_test,return_fn_test) for name in valid_queue_names}

def client_message_rec(client,server,message):
    print(client,message)
    pass
    #server.send_message()

server = WebsocketServer(13254, host='127.0.0.1')
server.set_fn_message_received(client_message_rec)
server.run_forever()
