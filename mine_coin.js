// Run `node mine_coin.js` once player is in mine room

const axios = require('axios');
const shajs = require('sha.js');

const mine_coin = async () => {
  let last_proof = null;

  try {
    const response = await axios.get(
      'https://lambda-treasure-hunt.herokuapp.com/api/bc/last_proof/',
      {
        headers: {
          Authorization: 'Token e9697a598203554fa1e1e59f590f4b2e87a662be'
        }
      }
    );

    last_proof = response.data.proof;
  } catch (error) {
    console.log(error);
  }

  const hash = (attempt) => {
    return shajs('sha256')
      .update(attempt)
      .digest('hex');
  };

  const valid_proof = (last_proof, proof) => {
    const guess_hash = hash(`${last_proof}${proof}`);

    let leadingZeros = '00000000';

    return guess_hash.startsWith(leadingZeros);
  };

  let proof = Math.floor(Math.random() * 1000000000);

  while (!valid_proof(last_proof, proof)) {
    proof = Math.floor(Math.random() * 1000000000);
  }

  try {
    const response = await axios.post(
      'https://lambda-treasure-hunt.herokuapp.com/api/bc/mine',
      {
        proof: proof,
        headers: {
          Authorization: 'Token e9697a598203554fa1e1e59f590f4b2e87a662be'
        }
      }
    );

    console.log('Proof found', response);
  } catch (error) {
    console.log('error finding proof', error);
  }
};

module.exports = mine_coin;
