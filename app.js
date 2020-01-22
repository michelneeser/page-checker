/**********

  TODOS
  [] read config file from remote location

**********/

const fs = require('fs');
const path = require('path');
const util = require('util');
// const puppeteer = require('puppeteer');
const chromium = require('chrome-aws-lambda');

const checkSingleUrl = async (url, selector, textToCheck, delay) => {

  // const browser = await puppeteer.launch();
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
  const readFile = util.promisify(fs.readFile);
  let checks = await readFile(path.join(__dirname, 'checks.json'));
  if (checks) {
    checks = JSON.parse(checks);
  }

  const results = [];
  for (const { name, url, selector, textToCheck, delay } of checks) {
    console.log(`checking ${name} (${url.substring(0, 50)})...`);
    const checkResult = await checkSingleUrl(url, selector, textToCheck, delay);

    let result = checkResult ?
      `==> ${name} SUCCESS: text "${textToCheck}" IS there` :
      `==> ${name} FAIL: text "${textToCheck}" IS NOT there`;

    console.log(result);
    results.push(result);
  }

  return results;
};

module.exports = check;