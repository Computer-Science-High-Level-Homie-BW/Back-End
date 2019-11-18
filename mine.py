import hashlib
import requests

import sys

import random


def proof_of_work(last_proof):

    print("Searching for next proof")
    proof = random.randint(1000000, 999999999)

    last_proof_encoded = f"{last_proof}".encode()

    last_hash = hashlib.sha256(last_proof_encoded).hexdigest()

    counter = 0

    while not valid_proof(last_hash, proof):
        proof = random.randint(1000000, 999999999)

        counter += 1

        if counter == 1000000:
            print(f"at {counter}")
            if requests.get(url=node_last_proof).json()["proof"] != last_proof:
                print(f"someone else found a proof")
                counter = 0
                return None
            counter = 0
    return proof


def valid_proof(last_hash, proof):
    new_encoded = f"{proof}".encode()

    new_hash = hashlib.sha256(new_encoded).hexdigest()

    return last_hash[-6:] == new_hash[:6]


if __name__ == '__main__':

    node_last_proof = "https://lambda-treasure-hunt.herokuapp.com/api/bc/last_proof"
    node_mine = "https://lambda-treasure-hunt.herokuapp.com/api/bc/mine/"

    coins_mined = 0

    f = open("token.txt", "r")
    id = f.read()
    print("Token is", id)
    f.close()

    while True:
        # Get the last proof from the server
        r = requests.get(url=node_last_proof)
        data = r.json()
        new_proof = proof_of_work(data.get('proof'))

        if new_proof is not None:
            post_data = {"proof": new_proof,
                         "id": id}

            r = requests.post(url=node_mine, json=post_data)
            data = r.json()
            print(data)
            if data.get('message') == 'New Block Forged':
                coins_mined += 1
                print("Total coins mined: " + str(coins_mined))
            else:
                print(data.get('message'))
