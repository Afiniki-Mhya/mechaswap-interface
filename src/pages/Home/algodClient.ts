import algosdk from 'algosdk';

const algodToken = '';
const algodServer = 'https://testnet-api.voi.sh';
const algodPort = 443;

export const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort); 