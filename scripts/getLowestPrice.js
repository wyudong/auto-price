import clipboard from 'clipboardy';
import { createWorker } from 'tesseract.js';
import robot from 'robotjs';

import {
  POS_INPUT_Y,
  POS_INPUT_END,
  POS_FIRST_ITEM_X,
  POS_FIRST_ITEM_Y,
  FIRST_ITEM_WIDTH,
  FIRST_ITEM_HEIGHT,
} from '../constants.js';

import { send } from '../notification.js';
import {
  sleep,
  getList,
  writeBmp,
  readable,
} from '../utils.js';

const watchedItems = getList('WATCHED_ITEMS');
const watchedPriceList = getList('WATCHED_PRICE');
console.log(watchedItems, watchedPriceList);

console.log('script will start in 3 sec');
await sleep(3000);

for (let i = 0; i < watchedItems.length; i++) {
  const watchedItem = watchedItems[i];
  const watchedPrice = watchedPriceList[i];

  // clear input field
  robot.moveMouse(POS_INPUT_END, POS_INPUT_Y);
  robot.mouseClick();
  for (let i = 0; i < 9; i++) {
    robot.keyTap('backspace');
  }

  // search
  clipboard.writeSync(watchedItem);
  robot.keyTap('v', 'control');
  await sleep(500);
  robot.keyTap('enter');
  await sleep(500);
  robot.keyTap('enter');
  await sleep(1500);

  // take screenshot of search results
  const filename = `.screenshots/${watchedItem}.png`;
  const width = FIRST_ITEM_WIDTH;
  const height = FIRST_ITEM_HEIGHT;
  const capture = robot.screen.capture(POS_FIRST_ITEM_X, POS_FIRST_ITEM_Y, width, height);
  await writeBmp({ data: capture.image, width: capture.width, height: capture.height }, filename);

  // ocr price
  const worker = await createWorker('eng');
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789',
  });
  const { data: { text } } = await worker.recognize(filename);
  await worker.terminate();

  const lines = text.split('\n');
  if (lines.length !== 3) {
    console.log('reading price failed');
    continue;
  }

  // send notification
  const currentPrice = readable(lines[0]);
  console.log(currentPrice);
  if (currentPrice <= watchedPrice) {
    const res = await send(watchedItem, `目前价格：${currentPrice}`);
    console.log(res);
  }
}
