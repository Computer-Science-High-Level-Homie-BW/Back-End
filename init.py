import hashlib
import requests

import sys
import json

import time

graph = {
    0: {"n": "?", "s": "?", "e": "?", "w": "?"}
}

if __name__ == '__main__':
    init_url = "https://lambda-treasure-hunt.herokuapp.com/api/adv/init/"

    init = requests.get(url=init_url, headers={
        'Authorization': 'Token e9697a598203554fa1e1e59f590f4b2e87a662be'})

    init_data = init.json()

    # print(init_data)

    move_url = "https://lambda-treasure-hunt.herokuapp.com/api/adv/move/"

    send = {
        "direction": "n"
    }

    move = requests.post(url=move_url, data=json.dumps(send), headers={
        'Authorization': 'Token e9697a598203554fa1e1e59f590f4b2e87a662be',
        'content-type': 'application/json',
    })

    move_data = move.json()

    print(move_data)

    # graph[move_data["room_id"]] = {}

    # for exit in move_data["exits"]:
    #     graph[move_data["room_id"]][exit] = "?"

    # print(graph)
