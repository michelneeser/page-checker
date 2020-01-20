const fs = require('fs');
const path = require('path');
const util = require('util');
const puppeteer = require('puppeteer');

const check = async (url, selector, textToCheck) => {

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const text = await page.evaluate((selector) => {
    return document.querySelector(selector).textContent;
  }, selector);

  await browser.close();

  return text === textToCheck;
};

(async () => {
  const readFile = util.promisify(fs.readFile);
  let checks = await readFile(path.join(__dirname, 'checks.json'));
  if (checks) {
    checks = JSON.parse(checks);
  }

  checks.forEach(async ({ url, selector, textToCheck }) => {
    console.log(`checking ${url}...`);
    const checkResult = await check(url, selector, textToCheck);

    if (checkResult) {
      console.log(`text ${textToCheck} IS there`);
    } else {
      console.log(`text ${textToCheck} is NOT there`);
    }
  });
})();