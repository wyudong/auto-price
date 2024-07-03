import Jimp from 'jimp';
import robot from 'robotjs';

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function writeScreenshot(file, dimension) {
  const { x, y, width, height } = dimension;
  const capture = robot.screen.capture(x, y, width, height);
  await writeBmp({ data: capture.image, width: capture.width, height: capture.height }, file);
}

function writeBmp(buffer, path) {
  return new Promise((resolve, reject) => {
    new Jimp(buffer, (err, image) => {
      if (err) {
        reject(err);
      }
      image.scale(1, Jimp.RESIZE_NEAREST_NEIGHBOR).contrast(1).write(path, () => {
        resolve();
      });
    });
  });
}

export function readable(number) {
  const NUMBER_E = 100000000;
  const NUMBER_W = 10000;
  const e = Math.floor(number / NUMBER_E);
  const w = Math.floor((number - e * NUMBER_E) / NUMBER_W);
  const r = Math.floor(number - e * NUMBER_E - w * NUMBER_W);
  const wStr = w.toString().padStart(4, '0');
  const rStr = r.toString().padStart(4, '0');
  if (e > 0) {
    return `${e}亿${wStr}万${rStr}`;
  } else if (w > 0) {
    return `${w}万${rStr}`;
  }
  return rStr;
}
