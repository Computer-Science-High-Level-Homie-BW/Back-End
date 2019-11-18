import hashlib
import requests

import sys
import json

import time

if __name__ == '__main__':
    # What is the server address? IE `python3 miner.py https://server.com/api/`
    if len(sys.argv) > 1:
        node = sys.argv[1]
    else:
        node = "https://lambda-treasure-hunt.herokuapp.com/api/adv/init/"

    # Load ID
    # f = open("christian.txt", "r")
    # id = f.readline()
    # print("ID is", id)
    # f.close()

    # Run forever until interrupted
    r = requests.get(url=node)
    # Handle non-json response
    try:
        data = r.json()
    except ValueError:
        print("Error:  Non-json response")
        print("Response returned:")
        print(r)
