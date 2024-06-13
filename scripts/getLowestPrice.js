import clipboard from 'clipboardy';
import { createWorker } from 'tesseract.js';
import robot from 'robotjs';

import {
  POS_INPUT_X,
  POS_INPUT_Y,
  POS_FIRST_ITEM_X,
  POS_FIRST_ITEM_Y,
  FIRST_ITEM_WIDTH,
  FIRST_ITEM_HEIGHT,
} from '../constants.js';

import { sleep, writeBmp } from '../utils.js';

console.log('script will start in 3 sec');
await sleep(3000);

// focus on input field
robot.moveMouse(POS_INPUT_X, POS_INPUT_Y);
robot.mouseClick('left', true);
await sleep(1000);

// search
clipboard.writeSync('幽暗戒指');
robot.keyTap('v', 'control');
await sleep(1000);
robot.keyTap('enter');
await sleep(1000);
robot.keyTap('enter');
await sleep(3000);

// take screenshot of search results
const filename = '.screenshots/sample.png'
const width = FIRST_ITEM_WIDTH;
const height = FIRST_ITEM_HEIGHT;
const capture = robot.screen.capture(POS_FIRST_ITEM_X, POS_FIRST_ITEM_Y, width, height);
console.log(capture);
await writeBmp({ data: capture.image, width: capture.width, height: capture.height }, filename);

const worker = await createWorker('eng');
await worker.setParameters({
  tessedit_char_whitelist: '0123456789',
});
const { data: { text } } = await worker.recognize(filename);
console.log(text);
await worker.terminate();
