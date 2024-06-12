const fs = require('fs');
const { Window } = require('node-screenshots');

let windows = Window.all();

windows.forEach((item) => {
  console.log({
    id: item.id,
    x: item.x,
    y: item.y,
    app: item.appName,
    title: item.title,
  });

  let image = item.captureImageSync();
  fs.writeFileSync(`${item.id}-sync.bmp`, image.toBmpSync());

  item.captureImage().then(async (data) => {
    console.log(data);
    let newImage = await data.crop(0, 0, 150, 150);
    fs.writeFileSync(`${item.id}.png`, await newImage.toPng());
  });
});
