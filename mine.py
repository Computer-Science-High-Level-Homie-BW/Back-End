import hashlib
import requests
import random


def proof_of_work(last_proof):

    print("Searching for next proof")
    proof = random.randint(10000000, 999999999)

    while not valid_proof(last_proof, proof):
        proof = random.randint(10000000, 999999999)

    print("PROOF FOUND", proof)

    return proof


def valid_proof(last_proof, proof):
    last_proof_encoded = f"{last_proof}".encode()

    new_encoded = f"{last_proof_encoded}{proof}".encode()

    new_hash = hashlib.sha256(new_encoded).hexdigest()

    print("new_hash", new_hash)

    return new_hash[:3] == "000"


if __name__ == '__main__':

    # proof_of_work(123456)

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
