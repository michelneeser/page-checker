const check = require('./app.js');

(async () => {
  const results = await check();

  let output = "==========\n";
  results.forEach(result => {
    output += `${result}\n`;
  });

  console.log(output);
})();