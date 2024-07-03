import clipboard from 'clipboardy';
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
    const { item: watchingItem, price, offset } = targets[i];
    const watchingPrice = parseInt(price);
    const logPrice = readable(watchingPrice);
    console.log(watchingItem);
    console.log(`预期 ${logPrice}`);

    // clear input field
    robot.moveMouse(POS_INPUT_END, POS_INPUT_Y);
    robot.mouseClick();
    for (let i = 0; i < 9; i++) {
      robot.keyTap('backspace');
    }

    // search
    clipboard.writeSync(watchingItem);
    robot.keyTap('v', 'control');
    await sleep(1000);
    robot.keyTap('enter');
    await sleep(500);
    robot.keyTap('enter');
    await sleep(1000);
    robot.keyTap('enter');

    // take screenshot of search results and ocr
    const fileWatchingItem = `.screenshots/${watchingItem}.png`;
    await writeScreenshot(fileWatchingItem, {
      x: offset ? POS_FIRST_ITEM_X - FIRST_ITEM_WIDTH : POS_FIRST_ITEM_X,
      y: POS_FIRST_ITEM_Y,
      width: FIRST_ITEM_WIDTH,
      height: FIRST_ITEM_HEIGHT,
    });
    const currentPrice = await recognize(fileWatchingItem);
    if (!currentPrice) {
      console.log('stocks may be null');
      await sleep(1000);
      continue;
    }
    const readablePrice = readable(currentPrice);
    console.log(`目前 ${readablePrice}`);

    // purchase
    if (currentPrice <= watchingPrice && toPurchase) {
      robot.moveMouse(POS_FIRST_ITEM_X, POS_FIRST_ITEM_Y);
      robot.mouseClick();
      await sleep(500);
      robot.moveMouse(BUTTON_PRUCHASE_X, BUTTON_PRUCHASE_Y);
      robot.mouseClick();
      await sleep(1000);
      robot.moveMouse(BUTTON_CONFIRM_X, BUTTON_CONFIRM_Y);
      robot.mouseClick();
      await sleep(1000);
      robot.mouseClick();
      const res = await send(watchingItem, `购入价格：${readablePrice}`);
      console.log(res);
    } else if (currentPrice <= watchingPrice) {
      const res = await send(watchingItem, `目前价格：${readablePrice}`);
      console.log(res);
    }

    console.log('====================');
    await sleep(5000);
  }
}
