const axios = require("axios");
const shajs = require("sha.js");

let last_proof = null;

const getLastProof = () => {
  axios
    .get("https://lambda-treasure-hunt.herokuapp.com/api/bc/last_proof/", {
      headers: {
        Authorization: "e9697a598203554fa1e1e59f590f4b2e87a662be",
      },
    })
    .then((response) => {
      last_proof = response.data.proof;
    })
    .catch((err) => console.log(err));
};

getLastProof();

const hash = (attempt) => {
  return shajs("sha256")
    .update(attempt)
    .digest("hex");
};

const valid_proof = (last_proof, proof) => {
  const guess_hash = hash(`${last_proof}${proof}`);

  let leadingZeros = "00000000";

  return guess_hash.startsWith(leadingZeros);
};

let proof = Math.floor(Math.random() * 1000000000);

while (!valid_proof(last_proof, proof)) {
  proof = Math.floor(Math.random() * 1000000000);
}

axios
  .post("https://lambda-treasure-hunt.herokuapp.com/api/bc/mine", {
    proof: proof,
    headers: {
      Authorization: "e9697a598203554fa1e1e59f590f4b2e87a662be",
    },
  })
  .then((response) => {
    console.log("Proof found", response);
  })
  .catch((err) => {
    console.log("proof not found", err);
  });
