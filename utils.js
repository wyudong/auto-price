import Jimp from 'jimp'
import _ from 'dotenv';
import fs from 'fs';


export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getList(key) {
  const data = _.parse(fs.readFileSync('.env'));
  return data[key].split(',').map(item => item.trim());
}

export function writeBmp(buffer, path) {
  return new Promise((resolve, reject) => {
    new Jimp(buffer, (err, image) => {
      if (err) {
        reject(err);
      }
      image.write(path);
      resolve();
    });
  });
}

export function readable(number) {
  const e = Math.floor(number / 100000000);
  const w = Math.floor((number - e * 100000000) / 10000);;
  if (e > 0) {
    return `${e}亿${w}万`;
  }
  return `${w}万`;
}
