const { By } = require("selenium-webdriver");
const { sleep } = require("./sleep");
module.exports = {
  captchaCheck: async function captchaCheck(driver) {
    try {
      let captchaFound = await driver.findElement(By.id("captcha-popup"));
      console.log(captchaFound);
      while (captchaFound) {
        console.log("Captcha detected");
        await sleep(10000);
        captchaCheck();
      }
    } catch (err) {
      console.log(err);
      Promise.resolve();
    }
  },
};
