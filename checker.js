const chromium = require('chrome-aws-lambda');

const checkUrl = async (url, selector, textToCheck, delay) => {
  // initialize Puppeteer
  const browser = await chromium.puppeteer.launch({
    executablePath: await chromium.executablePath,
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    headless: true
  });

  const page = await browser.newPage();
  await page.goto(url);

  // execute check
  let promise = new Promise((resolve) => {
    setTimeout(async (selector, textToCheck) => {
      const text = await page.evaluate((selector) => {
        if (selector) {
          const element = document.querySelector(selector);
          if (element) {
            return element.textContent;
          } else {
            return "";
          }
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

module.exports = checkUrl;