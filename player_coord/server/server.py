from websocket_server import WebsocketServer
import json

# Called for every client connecting (after handshake)
def new_client(client, server):
    print("New client connected and was given id %d" % client['id'])
    #server.send_message_to_all("Hey all, a new client has joined us")

# Called for every client disconnecting
def client_left(client, server):
    print("Client(%d) disconnected" % client['id'])

def client_ids(clients):
    all_clids = []
    for cli in clients:
        if "postid" in cli:
            all_clids.append(cli['postid'])
    return all_clids

def send_connection_info(server,client_source, client_dest):
    server.send_message(client_dest,json.dumps({
        "type": "connect_info",
        "name": client_source['postid'],
        "con_data": client_source['con_data'],
    }))

def client_mutually_connected(all_clients, client):
    for cli in all_clients:
        if "requested_name" in cli and cli['postid'] == client['requested_name'] and cli['requested_name'] == client['postid'] and client is not cli:
            return cli,client

# Called when a client sends a message
def message_received(client, server, message):
    messageobj = json.loads(message)
    print(server.clients)
    if messageobj['type'] == "postid":
        if len(messageobj['info']) > 100:
            server.send_message(client,json.dumps({
                "type": "error",
                "errname":"NAME_TOO_LONG"
            }))
        elif messageobj['info'] in client_ids(server.clients):
            server.send_message(client,json.dumps({
                "type": "error",
                "errname":"CLIENT_ID_USED"
            }))
        else:
            client['postid'] = messageobj['info']
            client['con_data'] = messageobj['outgoing']
            server.send_message(client,json.dumps({
                "type": "postid_success"
            }))
    elif messageobj['type'] == "get_client_info":
        server.send_message(client,json.dumps({
            "type": "clientlist",
            "info": client_ids(server.clients)
        }))
    elif messageobj['type'] == "request_connection":
        if 'requested_name' not in client:
            client['requested_name'] = messageobj['name']

            server.send_message(client,json.dumps({
                "type": "request_succeeded",
                "name": messageobj['name']
            }))
            res = client_mutually_connected(server.clients,client)
            if res is not None:
                con_client1, con_client2 = res
                send_connection_info(server,con_client1,con_client2)
                send_connection_info(server,con_client2,con_client1)
            else:
                print("no connection!")
        else:
            server.send_message(client,json.dumps({
                "type": "error",
                "errname": "ALREADY_REQUESTED",
            }))
    elif messageobj['type'] == "delete_connection_request":
        if 'requested_name' in client:
            req_name = client['requested_name']
            del client['requested_name']

            server.send_message(client,json.dumps({
                "type": "delete_request_succeeded",
                "name": req_name
            }))
        else:
            server.send_message(client,json.dumps({
                "type": "error",
                "errname": "NO_REQUEST_TO_DELETE",
            }))
    else:
        print("erronious message: {}".format(message))

if __name__ == "__main__":
    PORT = 9001
    server = WebsocketServer(PORT,host="0.0.0.0")
    server.set_fn_new_client(new_client)
    server.set_fn_client_left(client_left)
    server.set_fn_message_received(message_received)
    server.run_forever()
