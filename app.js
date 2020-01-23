/**********

  TODOS
  (nothing at the moment)

**********/

const fs = require('fs');
const path = require('path');
const util = require('util');
const chromium = require('chrome-aws-lambda');
const axios = require('axios');

const checkSingleUrl = async (url, selector, textToCheck, delay) => {
  const browser = await chromium.puppeteer.launch({
    executablePath: await chromium.executablePath,
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    headless: true
  });

  const page = await browser.newPage();
  await page.goto(url);

  let promise = new Promise((resolve) => {
    setTimeout(async (selector, textToCheck) => {
      const text = await page.evaluate((selector) => {
        if (selector) {
          return document.querySelector(selector).textContent;
        } else {
          return document.body.innerHTML;
        }
      }, selector);

      await browser.close();
      resolve(text.includes(textToCheck));
    }, delay, selector, textToCheck);
  });

  return promise;
};

const check = async () => {
  let checks;

  try {
    let configFilePath = path.join(__dirname, 'config.json');
    const readFile = util.promisify(fs.readFile);
    let config = JSON.parse(await readFile(configFilePath));
    checks = config.checks;

    if (config.remoteConfigUrl) {
      console.log(`reading checks from remote config at ${config.remoteConfigUrl}...`);
      checks = (await axios.get(config.remoteConfigUrl)).data.checks;
    }
  } catch (err) {
    console.error(err);
  }

  const results = [];

  if (checks) {
    for (const { name, url, selector, textToCheck, delay } of checks) {
      console.log(`checking ${name} (${url.substring(0, 50)})...`);
      const checkResult = await checkSingleUrl(url, selector, textToCheck, delay);

      let result = checkResult ?
        `==> ${name} SUCCESS: text "${textToCheck}" IS there` :
        `==> ${name} FAIL: text "${textToCheck}" IS NOT there`;

      console.log(result);
      results.push(result);
    }
  }

  return results;
};

module.exports = check;