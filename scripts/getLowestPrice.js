import clipboard from 'clipboardy';
import robot from 'robotjs';
import { createWorker } from 'tesseract.js';
import { send } from '../notification.js';
import {
  sleep,
  getList,
  writeBmp,
  readable,
} from '../utils.js';
import {
  POS_INPUT_Y,
  POS_INPUT_END,
  POS_FIRST_ITEM_X,
  POS_FIRST_ITEM_Y,
  FIRST_ITEM_WIDTH,
  FIRST_ITEM_HEIGHT,
} from '../constants.js';

const watchingItems = getList('WATCHED_ITEMS');
const watchingPrice_ = getList('WATCHED_PRICE');
console.log(watchingItems);
console.log('script will start in 3 sec');
await sleep(3000);

for (let i = 0; i < watchingItems.length; i++) {
  const watchingItem = watchingItems[i];
  const watchingPrice = watchingPrice_[i];
  const logPrice = readable(watchingPrice);
  console.log(`${watchingItem} ${logPrice}`);

  // clear input field
  robot.moveMouse(POS_INPUT_END, POS_INPUT_Y);
  robot.mouseClick();
  for (let i = 0; i < 9; i++) {
    robot.keyTap('backspace');
  }

  // search
  clipboard.writeSync(watchingItem);
  robot.keyTap('v', 'control');
  await sleep(5000);
  robot.keyTap('enter');
  await sleep(500);
  robot.keyTap('enter');
  await sleep(1500);

  // take screenshot of search results
  const filename = `.screenshots/${watchingItem}.png`;
  let capture = robot.screen.capture(POS_FIRST_ITEM_X, POS_FIRST_ITEM_Y, FIRST_ITEM_WIDTH, FIRST_ITEM_HEIGHT);
  await writeBmp({ data: capture.image, width: capture.width, height: capture.height }, filename);

  // ocr price
  const worker = await createWorker('eng');
  await worker.setParameters({ tessedit_char_whitelist: '0123456789' });
  let output = await worker.recognize(filename);
  let text = output.data.text;

  // try another region if price is not valid
  if (!/\d/.test(text)) {
    capture = robot.screen.capture(POS_FIRST_ITEM_X - 135, POS_FIRST_ITEM_Y, FIRST_ITEM_WIDTH, FIRST_ITEM_HEIGHT);
    await writeBmp({ data: capture.image, width: capture.width, height: capture.height }, filename);
    output = await worker.recognize(filename);
    text = output.data.text;
  }
  await worker.terminate();

  const lines = text.split('\n');
  if (lines.length !== 3) {
    console.log('invalid price');
    continue;
  }

  // send notification
  const currentPrice = readable(lines[0]);
  console.log(currentPrice);
  if (currentPrice < watchingPrice) {
    const res = await send(watchingItem, `目前价格：${currentPrice}`);
    console.log(res);
  }
}
