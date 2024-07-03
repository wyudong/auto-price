import compare from './price.js';
import { targets } from './env.js';
import { sleep } from '../utils.js';

console.log('script will start in 3 sec');
console.log(targets);
await sleep(3000);

const options = {};
const args = process.argv.slice(2);

if (args.includes('--purchase')) {
  options.toPurchase = true;
}

while(true) {
  await compare(targets, options);
  await sleep(5000);
}
