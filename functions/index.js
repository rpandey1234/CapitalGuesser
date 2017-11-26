'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');
const country_map = require('./countries.js').data;

// a. the action name from the Dialogflow intent
const CHECK_CAPITAL_ACTION = 'verify_capital';
const GIVE_UP_ACTION = 'give_up';
const WELCOME_ACTION = 'input.welcome';
// b. the parameters that are parsed from the intent
const CAPITAL_ARGUMENT = 'capital';
const NUM_QUESTIONS = 5;

// const CAPITAL_MAP = {
//   'Australia': 'Canberra',
//   'Ireland': 'Dublin',
//   'Thailand': 'Bangkok',
//   'Italy': 'Rome'
// }

/**
 * Set up app.data for use in the action
 * @param {DialogflowApp} app DialogflowApp instance
 */
const initData = app => {
  /** @type {AppData} */
  const countries = Object.keys(country_map);
  let index = Math.floor(Math.random() * countries.length);

  const data = app.data;
  if (!data.country) {
    data.country = Object.keys(country_map)[index];
  }
  return data;
};

const pickNewQuestion = app => {
  /** @type {AppData} */
  const countries = Object.keys(country_map);
  let index = Math.floor(Math.random() * countries.length);
  app.data.country = Object.keys(country_map)[index];
  return app.data;
}

exports.capitalGame = functions.https.onRequest((request, response) => {
  const app = new App({request, response});
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));

// c. The function that generates the silly name
  function verifyCapital (app) {
    const data = initData(app);

    let guess = app.getArgument(CAPITAL_ARGUMENT);
    console.log("Guess was ", guess);
    let country = data.country;
    let capital = country_map[country];
    let reply;
    if (guess === capital) {
      reply = `Correct, the capital of ${country} is ${capital}.`;
    } else {
      reply = `Sorry, that is incorrect. The capital of ${country} is ${capital}.`;
    }
    const newData = pickNewQuestion(app);
    reply += ` Now, what is the capital of ${newData.country}?`
    app.ask(reply);
  }
  // d. build an action map, which maps intent names to functions
  let actionMap = new Map();
  actionMap.set(CHECK_CAPITAL_ACTION, verifyCapital);

  function pickCountry (app) {
    const data = initData(app);
    let desc = `Welcome to Capital Guesser. We'll ask you ${NUM_QUESTIONS}
      questions about the capital of countries around the world. At the end,
      we'll tell you the total number correct. Your first question is:
      what is the capital of ${data.country}?`
    app.ask(desc);
  }
  actionMap.set(WELCOME_ACTION, pickCountry);

  function giveUp (app) {
    const data = initData(app);
    let country = data.country;
    let capital = country_map[country];
    app.tell(`Ok, here is the answer: The capital of ${country} is ${capital}.`);
  }
  actionMap.set(GIVE_UP_ACTION, giveUp);

  app.handleRequest(actionMap);
});
