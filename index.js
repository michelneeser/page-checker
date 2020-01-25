const check = require('./app.js');

(async () => {
  const results = await check();

  let output = "========== SUMMARY ==========\n";
  results.forEach(result => {
    output += `${result}\n`;
  });

  console.log(output);
})();