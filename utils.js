import Jimp from 'jimp'

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
