'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');

// a. the action name from the Dialogflow intent
const CHECK_CAPITAL_ACTION = 'verify_capital';
const WELCOME_ACTION = 'input.welcome';
// b. the parameters that are parsed from the intent
const CAPITAL_ARGUMENT = 'capital';

const CAPITAL_MAP = {
  'Australia': 'Canberra',
  'Ireland': 'Dublin',
  'Thailand': 'Bangkok',
  'Italy': 'Rome'
}

/**
 * Set up app.data for use in the action
 * @param {DialogflowApp} app DialogflowApp instance
 */
const initData = app => {
  /** @type {AppData} */
  const countries = Object.keys(CAPITAL_MAP);
  let index = Math.floor(Math.random() * countries.length);

  const data = app.data;
  if (!data.country) {
    data.country = Object.keys(CAPITAL_MAP)[index];
  }
  return data;
};

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
    let capital = CAPITAL_MAP[country];
    if (guess === capital) {
      app.tell(`Correct, the capital of ${country} is ${capital}`);
    } else {
      app.tell('Sorry, that is incorrect');
      // TODO: allow guess again

    }
  }
  // d. build an action map, which maps intent names to functions
  let actionMap = new Map();
  actionMap.set(CHECK_CAPITAL_ACTION, verifyCapital);

  function pickCountry (app) {
    const data = initData(app);
    app.ask('What is the capital of ' + data.country + '?');
  }
  actionMap.set(WELCOME_ACTION, pickCountry);

  app.handleRequest(actionMap);
});
