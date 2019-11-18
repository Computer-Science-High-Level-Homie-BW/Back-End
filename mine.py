import hashlib
import requests

import sys
import json


def proof_of_work(block):
    block_string = json.dumps(block, sort_keys=True).encode()
    proof = 0
    while not valid_proof(block_string, proof):
        proof += 1
    return proof

def valid_proof(block_string, proof):
    guess = f"{block_string}{proof}".encode()
    guess_hashed = hashlib.sha256(guess).hexdigest()

    return guess_hashed[:6] == "000000"


if __name__ == '__main__':

    if len(sys.argv) > 1:
        node = sys.argv[1]
    else:
        node = "https://lambda-treasure-hunt.herokuapp.com/api/bc/"

    r = requests.get(url=node, headers={
                     'Authorization': 'Token e9697a598203554fa1e1e59f590f4b2e87a662be'})

    try:
        data = r.json()
        print(data)
    except ValueError:
        print("Error:  Non-json response")
        print("Response returned:")
        print(r)
