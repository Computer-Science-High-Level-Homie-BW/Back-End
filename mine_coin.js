// Run `node mine_coin.js` once player is in mine room
const axios = require('axios');
const shajs = require('sha.js');
let last_proof = null;
const mine_coin = async () => {
  try {
    const response = await axios.get(
      'https://lambda-treasure-hunt.herokuapp.com/api/bc/last_proof/',
      {
        headers: {
          Authorization: 'Token #'
        }
      }
    );
    console.log('get last proof', response.data);
    last_proof = response.data.proof;
  } catch (error) {
    console.log(error);
  }
  console.log('END', last_proof);
  const hash = (attempt) => {
    return shajs('sha256')
      .update(attempt)
      .digest('hex');
  };
  const valid_proof = (last_proof, proof) => {
    const guess_hash = hash(`${last_proof}${proof}`);
    // current dificulty 6 - 6 zeros
    let leadingZeros = '000000';
    // console.log(guess_hash);
    return guess_hash.startsWith(leadingZeros);
  };
  let proof = Math.floor(Math.random() * 1000000000);
  while (!valid_proof(last_proof, proof)) {
    proof = Math.floor(Math.random() * 1000000000);
  }
  console.log(('PROOF FOUND', proof));
  const SEND_PROOF = async () => {
    try {
      const response = await axios.post(
        'https://lambda-treasure-hunt.herokuapp.com/api/bc/mine',
        {
          proof: proof
        },
        {
          headers: {
            Authorization: 'Token #'
          }
        }
      );
      console.log('Proof found');
    } catch (error) {
      console.log('error finding proof');
    }
  };
  SEND_PROOF();
};
mine_coin();