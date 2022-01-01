const { Builder, By, Key, until } = require("selenium-webdriver");
const { sleep } = require("./sleep");
require('dotenv').config()
const { captchaCheck } = require("./captchaCheck");
const ora = require("ora");
const logUpdate = require("log-update");

module.exports = {
  sharePersonalCloset: async function (sort) {
    logUpdate(`Sorting by ${sort}`);
    console.time("Closet Time Taken:");

    let driver = await new Builder().forBrowser("firefox").build();

    await driver.get("https://poshmark.com/login");
    try {
      let stupidLoginPage = await driver.findElement(By.name("userHandle"));
      if (stupidLoginPage) {
        logUpdate("❌ Stupid login page found");
        driver.quit();
      }
    } catch (err) {
      logUpdate("✅ Normal login page found");
    }
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
        logUpdate("❌ Captcha detected");
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
      logUpdate("✅ No Captcha detected");
    }
    await driver.get(
      `https://poshmark.com/closet/bunchofbates?availability=available&sort_by=${sort}`
    );
    let bottom = false;
    let scrollNumber = 0;
    let currentHeight = await driver.executeScript(
      "return document.documentElement.scrollHeight"
    );
    while (!bottom) {
      logUpdate("Scroll # ", scrollNumber);
      let scrollScript = "window.scrollTo(0, document.body.scrollHeight);";
      driver.executeScript(scrollScript);
      await sleep(2500);
      let newHeight = await driver.executeScript(
        "return document.documentElement.scrollHeight"
      );
      if (currentHeight === newHeight) {
        bottom = true;
      } else {
        scrollNumber++;
        currentHeight = newHeight;
      }
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
    logUpdate(`Found ${buttons.length} items to share`);
    buttons.reverse();
    let totalItems = buttons.length;
    for (let i = 0; i < buttons.length; i++) {
      let captchaCheck = false;
      let captchaDisplayed;
      try {
        let captchaPath = "//div[@class='d--fl  jc--c g-recaptcha-con']";
        let found = await driver.findElement(By.xpath(captchaPath));
        captchaDisplayed = await found.isDisplayed();
        if (captchaDisplayed) {
          captchaCheck = true;
        }
      } catch (err) {}
      while (captchaCheck) {
        try {
          let captchaPath = "//div[@class='d--fl  jc--c g-recaptcha-con']";
          let found = await driver.findElement(By.xpath(captchaPath));
          console.log("Is found and displayed? ", await found.isDisplayed());
          if (!found) {
            console.log("no captcha so should set false");
            captchaCheck = false;
          }
          let result = await found.isDisplayed();
          if (!result) {
            console.log("no captcha so should set false");
            captchaCheck = false;
          }
          console.log("❌ Captcha detected");
          await sleep(5000);
        } catch (err) {
          console.log("no captcha so should set false");
          captchaCheck = false;
        }
      }
      try {
        // let spinner = ora.spinner("dots12").start();
        // logUpdate(`${ora(`Sharing item number: ${i}/${totalItems}`).start()}`);
        logUpdate(`Sharing item number: ${i + 1}/${totalItems}`);

        await driver.executeScript("arguments[0].click();", buttons[i][0]);
        await sleep(500);
      } catch (err) {
        console.log("Error in first click", err);
        // driver.quit();
      }
      try {
        let sharePath = "//i[@class='icon pm-logo-white']";
        let shareToFollowers = await driver.findElements(By.xpath(sharePath));
        await driver.executeScript(
          "arguments[0].click();",
          shareToFollowers[0]
        );
        await sleep(500);
      } catch (err) {
        console.log("Error in second click", err);
        // driver.quit();
      }
    }
    console.timeEnd("Closet Time Taken:");
    driver.quit();
  },
};
