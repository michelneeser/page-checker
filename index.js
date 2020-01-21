const fs = require('fs');
const path = require('path');
const util = require('util');
const puppeteer = require('puppeteer');

const checkSingleUrl = async (url, selector, textToCheck) => {

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const text = await page.evaluate((selector) => {
    if (selector) {
      return document.querySelector(selector).textContent;
    } else {
      return document.body.innerHTML;
    }
  }, selector);

  await browser.close();

  return text.includes(textToCheck);
};

const check = async () => {
  const readFile = util.promisify(fs.readFile);
  let checks = await readFile(path.join(__dirname, 'checks.json'));
  if (checks) {
    checks = JSON.parse(checks);
  }

  checks.forEach(async ({ name, url, selector, textToCheck }) => {
    console.log(`checking ${name} (${url.substring(0, 50)})...`);
    const checkResult = await checkSingleUrl(url, selector, textToCheck);

    if (checkResult) {
      console.log(`==> ${name} SUCCESS: text "${textToCheck}" IS there`);
    } else {
      console.log(`==> ${name} FAIL: text "${textToCheck}" IS NOT there`);
    }
  });
};

check();

exports.handler = check; // for AWS Lambda