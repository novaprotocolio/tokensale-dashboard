import { writeFile, readFileSync, existsSync } from 'fs';
import { MD5 } from 'crypto-js';

// This is good for local dev environments, when it's better to
// store a projects environment variables in a .gitignore'd file
require('dotenv').config();

// Would be passed to script like this:
// `ts-node set-env.ts --environment=dev`
// we get it from yargs's argv object
const environment = process.argv[2] || 'dev';

let tokenSaleAddress = process.env.TOKEN_SALE;
let novaTokenAddress = process.env.NOVA_TOKEN;

const getAddressFromContract = contract => {
  const values: any = Object.values(contract.networks);
  return values[0].address;
};

if (!tokenSaleAddress) {
  const tokenSale = require('../../contracts/build/contracts/TokenSale.json');
  tokenSaleAddress = getAddressFromContract(tokenSale);
}

if (!novaTokenAddress) {
  const novaToken = require('../../contracts/build/contracts/NovaToken.json');
  novaTokenAddress = getAddressFromContract(novaToken);
}

const targetPath = `./src/environments/environment.${environment}.ts`;
const envConfigContent = `
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses environment.ts, but if you do
// ng build --env=prod then environment.prod.ts will be used instead.
// The list of which env maps to which file can be found in .angular-cli.json.

export const environment = {
  production: ${environment === 'prod' ? 'true' : 'false'},
  tokenSale: '${tokenSaleAddress}',
  novaToken: '${novaTokenAddress}',
  apiURL: '${process.env.API_URL}',
  mainNetWeb3: '${process.env.MAINNET_WEB3}'
};
`;

const hash1 = MD5(envConfigContent).toString();
let hash2 = null;
if (existsSync(targetPath)) {
  hash2 = MD5(readFileSync(targetPath).toString()).toString();
}

if (hash1 != hash2) {
  writeFile(targetPath, envConfigContent, function(err) {
    if (err) {
      console.log(err);
    }

    console.log(`Output generated at ${targetPath}`);
  });
}
