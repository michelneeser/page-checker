/**********

  TODOS:
  everything is fine at the moment :)

**********/

const fs = require('fs');
const path = require('path');
const util = require('util');
const axios = require('axios');

const checkUrl = require('./checker.js');

const executeChecks = async () => {
  let checks;

  // read checks config
  try {
    let configFilePath = path.join(__dirname, 'config.json');
    const readFile = util.promisify(fs.readFile);
    let config = JSON.parse(await readFile(configFilePath));

    if (config.remoteConfigUrl && config.remoteConfigUrl.startsWith('http')) {
      console.log(`reading checks from remote config at ${config.remoteConfigUrl}...`);
      checks = (await axios.get(config.remoteConfigUrl)).data.checks;
    } else {
      checks = config.checks;
    }
  } catch (err) {
    console.error('Error occurred while trying to read config!', err);
  }

  // perform checks
  const results = [];

  if (checks) {
    for (const { name, url, selector, textToCheck, delay } of checks) {
      console.log(`checking ${name} (${url.substring(0, 50)})...`);
      const checkResult = await checkUrl(url, selector, textToCheck, delay);

      let result = checkResult ?
        `==> ${name} SUCCESS: text "${textToCheck}" IS there` :
        `==> ${name} FAIL: text "${textToCheck}" IS NOT there`;

      console.log(result);
      results.push(result);
    }
  }

  return results;
};

module.exports = executeChecks;