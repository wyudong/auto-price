import Jimp from 'jimp';

const NUMBER_WIDTH = 5;
const NUMBER_HEIGHT = 8;
const NUMBER_SPACING = 1;
const NUM_1 = [
    0,   0, 255,   0,   0,   0, 255, 255,   0,   0,
    0,   0, 255,   0,   0,   0,   0, 255,   0,   0,
    0,   0, 255,   0,   0,   0,   0, 255,   0,   0,
    0,   0, 255,   0,   0,   0, 255, 255, 255,   0,
];
const NUM_2 = [
    0, 255, 255, 255,   0, 255,   0,   0,   0, 255,
  255,   0,   0,   0, 255,   0,   0,   0, 255,   0,
    0,   0, 255,   0,   0,   0, 255,   0,   0,   0,
  255,   0,   0,   0,   0, 255, 255, 255, 255, 255,
];
const NUM_3 = [
    0, 255, 255, 255,   0, 255,   0,   0,   0, 255,
    0,   0,   0,   0, 255,   0,   0, 255, 255,   0,
    0,   0,   0,   0, 255,   0,   0,   0,   0, 255,
  255,   0,   0,   0, 255,   0, 255, 255, 255,   0,
];
const NUM_4 = [
    0,   0,   0, 255,   0,   0,   0, 255, 255,   0,
    0,   0, 255, 255,   0,   0, 255,   0, 255,   0,
  255,   0,   0, 255,   0, 255, 255, 255, 255, 255,
    0,   0,   0, 255,   0,   0,   0, 255, 255, 255,
];
const NUM_5 = [
  255, 255, 255, 255, 255, 255,   0,   0,   0,   0,
  255,   0,   0,   0,   0, 255, 255, 255, 255,   0,
  255,   0,   0,   0, 255,   0,   0,   0,   0, 255,
  255,   0,   0,   0, 255,   0, 255, 255, 255,   0,
];
const NUM_6 = [
    0,   0, 255, 255,   0,   0, 255,   0,   0, 255,
  255,   0,   0,   0,   0, 255,   0, 255, 255,   0,
  255, 255,   0,   0, 255, 255,   0,   0,   0, 255,
  255,   0,   0,   0, 255,   0, 255, 255, 255,   0,
];
const NUM_7 = [
    0, 255, 255, 255, 255,   0,   0,   0,   0, 255,
    0,   0,   0, 255,   0,   0,   0,   0, 255,   0,
    0,   0, 255,   0,   0,   0,   0, 255,   0,   0,
    0,   0, 255,   0,   0,   0,   0, 255,   0,   0,
];
const NUM_8 = [
  0,   255, 255, 255,   0, 255,   0,   0,   0, 255,
  255,   0,   0,   0, 255,   0, 255, 255, 255,   0,
  255,   0,   0,   0, 255, 255,   0,   0,   0, 255,
  255,   0,   0,   0, 255,   0, 255, 255, 255,   0,
];
const NUM_9 = [
    0, 255, 255, 255,   0, 255,   0,   0,   0, 255,
  255,   0,   0,   0, 255, 255,   0,   0, 255, 255,
    0, 255, 255,   0, 255,   0,   0,   0,   0, 255,
  255,   0,   0, 255,   0,   0, 255, 255,   0,   0,
];
const NUM_0 = [
    0, 255, 255, 255,   0, 255,   0,   0,   0, 255,
  255,   0,   0,   0, 255, 255,   0,   0,   0, 255,
  255,   0,   0,   0, 255, 255,   0,   0,   0, 255,
  255,   0,   0,   0, 255,   0, 255, 255, 255,   0,
];
const PUNC_COMMA = [
    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
    0, 255,   0,   0,   0,   0, 255,   0,   0,   0,
];

export function recognize(path) {
  return new Promise((resolve, reject) => {
    Jimp.read(path).then((image) => {
      const comma = findComma(image);
      if (!comma) {
        console.log('comma not found');
        resolve(null);
      }
      const results = matchNumbers(image, comma);
      resolve(parseInt(results.reverse().join('')));
    }).catch((err) => {
      reject(err);
    });;
  });
}

function findComma(image) {
  const { bitmap } = image;
  const { width, height } = bitmap;
  const pos = {};

  for (let y = height - 1; y >= 0; y--) {
    for (let x = width - 1; x >= 0; x--) {
      const { r: val } = Jimp.intToRGBA(image.getPixelColor(x, y));
      if (val === 255) {
        pos.x = x;
        pos.y = y;
        return pos;
      }
    }
  }

  return pos;
}

function matchNumbers(image, comma) {
  const { x: baseX, y: baseY } = comma;
  const results = [];

  // hundred
  let startX = baseX + NUMBER_WIDTH + NUMBER_SPACING;
  let startY = baseY - NUMBER_HEIGHT;
  let pixels = getPixels(image, startX, startY);
  const hundred = parsePixels(pixels);

  // ten
  startX = startX + NUMBER_WIDTH + NUMBER_SPACING;
  pixels = getPixels(image, startX, startY);
  const ten = parsePixels(pixels);

  // one
  startX = startX + NUMBER_WIDTH + NUMBER_SPACING;
  pixels = getPixels(image, startX, startY);
  const one = parsePixels(pixels);

  // thounsand
  startX = baseX - NUMBER_WIDTH - NUMBER_SPACING;
  pixels = getPixels(image, startX, startY);
  const thousand = parsePixels(pixels);
  results.push(one, ten, hundred, thousand);

  // ten-thounsand
  startX = startX - NUMBER_WIDTH - NUMBER_SPACING;
  pixels = getPixels(image, startX, startY);
  const tenThousand = parsePixels(pixels);
  if (isNaN(tenThousand)) {
    return results;
  }
  results.push(tenThousand);

  // hundred-thounsand
  startX = startX - NUMBER_WIDTH - NUMBER_SPACING;
  pixels = getPixels(image, startX, startY);
  const hundredThousand = parsePixels(pixels);
  if (isNaN(hundredThousand)) {
    return results;
  }
  results.push(hundredThousand);

  // comma for million
  startX = startX - NUMBER_WIDTH - NUMBER_SPACING;
  pixels = getPixels(image, startX, startY);
  const commaM = parsePixels(pixels);
  if (commaM !== -1) {
    return results;
  }

  // million
  startX = startX - NUMBER_WIDTH - NUMBER_SPACING;
  pixels = getPixels(image, startX, startY);
  const million = parsePixels(pixels);
  if (isNaN(million)) {
    return results;
  }
  results.push(million);

  // ten-million
  startX = startX - NUMBER_WIDTH - NUMBER_SPACING;
  pixels = getPixels(image, startX, startY);
  const tenMillion = parsePixels(pixels);
  if (isNaN(tenMillion)) {
    return results;
  }
  results.push(tenMillion);

  // hundred-million
  startX = startX - NUMBER_WIDTH - NUMBER_SPACING;
  pixels = getPixels(image, startX, startY);
  const hundredMillion = parsePixels(pixels);
  if (isNaN(hundredMillion)) {
    return results;
  }
  results.push(hundredMillion);

  // comma for billion
  startX = startX - NUMBER_WIDTH - NUMBER_SPACING;
  pixels = getPixels(image, startX, startY);
  const commaB = parsePixels(pixels);
  if (commaB !== -1) {
    return results;
  }

  // billion
  startX = startX - NUMBER_WIDTH - NUMBER_SPACING;
  pixels = getPixels(image, startX, startY);
  const billion = parsePixels(pixels);
  if (isNaN(billion)) {
    return results;
  }
  results.push(billion);

  // ten-billion
  startX = startX - NUMBER_WIDTH - NUMBER_SPACING;
  pixels = getPixels(image, startX, startY);
  const tenBillion = parsePixels(pixels);
  if (isNaN(tenBillion)) {
    return results;
  }
  results.push(tenBillion);

  // hundred-billion
  startX = startX - NUMBER_WIDTH - NUMBER_SPACING;
  pixels = getPixels(image, startX, startY);
  const hundredBillion = parsePixels(pixels);
  if (isNaN(hundredBillion)) {
    return results;
  }
  results.push(hundredBillion);

  return results;
}

function getPixels(image, startX, startY) {
  const pixels = [];
  for (let y = startY; y < startY + NUMBER_HEIGHT; y++) {
    for (let x = startX; x < startX + NUMBER_WIDTH; x++) {
      const { r: val } = Jimp.intToRGBA(image.getPixelColor(x, y));
      pixels.push(val);
    }
  }
  return pixels;
}

function parsePixels(pixels) {
  let num = NaN;

  if (arrayEqual(pixels, NUM_1)) {
    num = 1;
  } else if (arrayEqual(pixels, NUM_2)) {
    num = 2;
  } else if (arrayEqual(pixels, NUM_3)) {
    num = 3;
  } else if (arrayEqual(pixels, NUM_4)) {
    num = 4;
  } else if (arrayEqual(pixels, NUM_5)) {
    num = 5;
  } else if (arrayEqual(pixels, NUM_6)) {
    num = 6;
  } else if (arrayEqual(pixels, NUM_7)) {
    num = 7;
  } else if (arrayEqual(pixels, NUM_8)) {
    num = 8;
  } else if (arrayEqual(pixels, NUM_9)) {
    num = 9;
  } else if (arrayEqual(pixels, NUM_0)) {
    num = 0;
  } else if (arrayEqual(pixels, PUNC_COMMA)) {
    num = -1;
  }

  return num;
}

function arrayEqual(array1, array2) {
  return (array1.length === array2.length) && array1.every(function(element, index) {
    return element === array2[index];
  });
}
