const inquirer = require("inquirer");
const { BottomBar } = require("inquirer");
const chalk = require("chalk");
const cliSpinners = require("cli-spinners");

const log = console.log;
const { shareBrands } = require("./shareBrands");
const { sharePersonalCloset } = require("./sharePersonalCloset");
const list = require("./brands");
inquirer.registerPrompt("search-list", require("inquirer-search-list"));
let ui = new inquirer.ui.BottomBar();

let questions = [
  {
    type: "search-list",
    name: "brand",
    message: "What brand do you want to share?",
    choices: list,
    filter: function (val) {
      return val.toLowerCase();
    },
  },
  {
    type: "input",
    name: "quantity",
    message:
      "How many pages do you want to share?\n(Default: 0 - just the initial page)",
    validate: function (value) {
      var valid = !isNaN(parseFloat(value));
      return valid || "Please enter a number";
    },
    filter: Number,
  },
];
let questionsCloset = [
  {
    type: "list",
    name: "sort",
    message: "In what order do you want your closet sorted?",
    choices: [
      "Recently Added",
      "Price Desc ($$$ -> $)",
      "Price Asc ($ -> $$$)",
      "Recently Shared",
      "Recently Price Dropped",
    ],
    filter: function (val) {
      if (val === "Price Desc ($$$ -> $)") {
        return "price_desc";
      } else if (val === "Price Asc ($ -> $$$)") {
        return "price_asc";
      } else if (val === "Recently Shared") {
        return "best_match";
      } else if (val === "Recently Added") {
        return "added_desc";
      } else if (val === "Recently Price Dropped") {
        return "price_drop";
      }
    },
  },
];

function beginSharing() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "typeOfSharing",
        message: "What would you like to share?",
        choices: ["My own closet", "Random Brand Items"],
        filter: function (val) {
          return val.toLowerCase();
        },
      },
    ])
    .then((answers) => {
      const { typeOfSharing } = answers;
      if (typeOfSharing === "my own closet") {
        inquirer
          .prompt(questionsCloset)
          .then(async ({ sort }) => {
            try {
              sharePersonalCloset(sort);
            } catch (err) {
              console.log(err);
              driver.quit();
            } finally {
              await driver.quit();
            }
          })
          .catch((error) => {
            if (error.isTtyError) {
              // Prompt couldn't be rendered in the current environment
            } else {
              // Something else when wrong
            }
          });
      } else if (typeOfSharing === "random brand items") {
        inquirer
          .prompt(questions)
          .then(async ({ brand, quantity }) => {
            try {
              shareBrands(brand, quantity);
            } catch (err) {
              console.log(err);
              driver.quit();
            } finally {
              await driver.quit();
            }
          })
          .catch((error) => {
            if (error.isTtyError) {
              // Prompt couldn't be rendered in the current environment
            } else {
              // Something else when wrong
            }
          });
      }
    });
}

function main() {
  log(
    chalk.bgMagenta.white("------------- Welcome to Poshie-bot! ------------- ")
  );
  log(chalk.magenta("  Your one stop shop for sharing Poshmark items."));
  log(chalk.magenta("---------------------------------------------------"));
  beginSharing();
}

main();
