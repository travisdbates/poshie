const { Builder, By, Key, until } = require("selenium-webdriver");
const { sleep } = require("./sleep");

module.exports = {
  shareBrands: async function (brand, quantity) {
    console.time("Brand Time Taken:");

    let driver = await new Builder().forBrowser("firefox").build();

    await driver.get("https://poshmark.com/login");
    await driver
      .findElement(By.name("login_form[username_email]"))
      .sendKeys(process.env.POSH_USERNAME);
    await driver
      .findElement(By.name("login_form[password]"))
      .sendKeys(process.env.POSH_PASSWORD, Key.ENTER);
    await sleep(2500);

    try {
      let error = await driver.findElement(By.css("span.base_error_message"));
      if (error.id_) {
        let url = await driver.getCurrentUrl();
        let moveOn = false;
        while (!moveOn) {
          await sleep(5000);
          url = await driver.getCurrentUrl();
          if (url === "https://poshmark.com/feed?login=true") {
            moveOn = true;
          }
        }
      }
    } catch (err) {
      console.log("No Captcha detected");
    }
    await driver.get(`https://poshmark.com/brand/${brand.replace(" ", "_")}`);
    for (let i = 0; i < quantity; i++) {
      console.log("Scroll # ", i);
      let scrollScript = "window.scrollTo(0, document.body.scrollHeight);";
      driver.executeScript(scrollScript);
      await sleep(2000);
    }

    let item_pat =
      "//div[@class='d--fl ai--c social-action-bar__action social-action-bar__share']";

    let items = await driver.findElements(By.xpath(item_pat));
    let buttons = [];
    for (let i = 0; i < items.length; i++) {
      let result = await items[i].findElements(
        By.css("i[class='icon share-gray-large']")
      );
      buttons.push(result);
    }
    console.log(`Found ${buttons.length} items to share`);
    for (let i = 0; i < buttons.length; i++) {
      let captchaCheck = true;
      while (captchaCheck) {
        try {
          let found = await driver.findElement(By.id("captcha-popup"));
          if (!found) {
            captchaCheck = false;
          }
          if (found.isDisplayed()) {
            captchaCheck = false;
          }
          console.log("❌ Captcha detected");
          await sleep(5000);
        } catch (err) {
          captchaCheck = false;
        }
      }
      try {
        console.log(`Sharing item number: ${i + 1}`);
        await driver.executeScript("arguments[0].click();", buttons[i][0]);
        await sleep(500);
      } catch (err) {
        console.log("Error in first click", err);
        //   driver.quit();
      }
      try {
        let sharePath = "//a[@class='internal-share__link']";
        let shareToFollowers = await driver.findElements(By.xpath(sharePath));
        await driver.executeScript(
          "arguments[0].click();",
          shareToFollowers[0]
        );
        await sleep(500);
      } catch (err) {
        console.log("Error in second click", err);
        //   driver.quit();
      }
    }
    console.timeEnd("Brand Time Taken:");
    driver.quit();
  },
};
