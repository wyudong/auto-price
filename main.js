import { createWorker } from 'tesseract.js';

const worker = await createWorker('eng');
await worker.setParameters({
  tessedit_char_whitelist: '0123456789',
});
const { data: { text } } = await worker.recognize('./test-region.jpg');
console.log(text);
await worker.terminate();
