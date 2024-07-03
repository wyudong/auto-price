import _ from 'dotenv';
import fs from 'fs';
import querystring from 'querystring';

const data = _.parse(fs.readFileSync('.env'));
const key = data.SENDKEY;

export async function send(text, desp) {
  const postData = querystring.stringify({ text, desp });
  const url = `https://sctapi.ftqq.com/${key}.send`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
    },
    body: postData,
  });

  const data = await response.text();
  return data;
}
