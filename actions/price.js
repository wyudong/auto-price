import robot from 'robotjs';
import { send } from '../libs/notification.js';
import { recognize } from '../libs/ocr.js';
import {
  sleep,
  writeScreenshot,
  readable,
} from '../utils.js';
import {
  POS_INPUT_Y,
  POS_INPUT_END,
  POS_FIRST_ITEM_X,
  POS_FIRST_ITEM_Y,
  FIRST_ITEM_WIDTH,
  FIRST_ITEM_HEIGHT,
  BUTTON_PRUCHASE_X,
  BUTTON_PRUCHASE_Y,
  BUTTON_CONFIRM_X,
  BUTTON_CONFIRM_Y,
} from '../constants.js';

export default async function compare(targets, options) {
  const { toPurchase } = options;

  for (let i = 0; i < targets.length; i++) {
    const { item: watchingItem, price, pinyin, offset } = targets[i];
    const watchingPrice = parseInt(price);
    const logPrice = readable(watchingPrice);
    console.log(watchingItem);
    console.log(`预期 ${logPrice}`);

    await clearInput();

    await search(pinyin);

    // take screenshot of search results
    const imagePath = `.screenshots/${watchingItem}.png`;
    await writeScreenshot(imagePath, {
      x: offset ? POS_FIRST_ITEM_X - FIRST_ITEM_WIDTH : POS_FIRST_ITEM_X,
      y: POS_FIRST_ITEM_Y,
      width: FIRST_ITEM_WIDTH,
      height: FIRST_ITEM_HEIGHT,
    });

    // ocr
    const currentPrice = await recognize(imagePath);
    if (!currentPrice) {
      console.log('stocks may be null');
      await sleep(5000);
      continue;
    }

    const readablePrice = readable(currentPrice);
    console.log(`目前 ${readablePrice}`);

    // purchase or send notification
    if (currentPrice <= watchingPrice && toPurchase) {
      await purchaseItem();
      const res = await send(watchingItem, `购入价格：${readablePrice}`);
      console.log(res);
    } else if (currentPrice <= watchingPrice) {
      const res = await send(watchingItem, `目前价格：${readablePrice}`);
      console.log(res);
    }

    await sleep(5000);
  }
}

async function clearInput() {
  robot.moveMouse(POS_INPUT_END, POS_INPUT_Y);
  robot.mouseClick();
  for (let i = 0; i < 10; i++) {
    robot.keyTap('backspace');
    await sleep(100);
  }
}

async function search(pinyin) {
  for (const char of pinyin) {
    robot.keyTap(char);
    await sleep(50);
  }
  robot.keyTap('enter');
  await sleep(500);
  robot.keyTap('enter');
  await sleep(1000);
  robot.keyTap('enter');
}

async function purchaseItem() {
  robot.moveMouse(POS_FIRST_ITEM_X, POS_FIRST_ITEM_Y);
  robot.mouseClick();
  await sleep(2000);
  robot.moveMouse(BUTTON_PRUCHASE_X, BUTTON_PRUCHASE_Y);
  robot.mouseClick();
  await sleep(3000);
  robot.moveMouse(BUTTON_CONFIRM_X, BUTTON_CONFIRM_Y);
  robot.mouseClick();
  await sleep(1000);
  robot.mouseClick();
}
