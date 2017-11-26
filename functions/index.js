'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');
const country_map = require('./countries.js').data;

// a. the action name from the Dialogflow intent
const CHECK_CAPITAL_ACTION = 'verify_capital';
const GIVE_UP_ACTION = 'give_up';
const WELCOME_ACTION = 'input.welcome';
const END_GAME_ACTION = 'end_game';
// b. the parameters that are parsed from the intent
const CAPITAL_ARGUMENT = 'capital';

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
  if (!data.isInitialized) {
    data.isInitialized = true;
    data.country = Object.keys(country_map)[index];
    data.numAsked = 0;
    data.numCorrect = 0;
  }
  return data;
};

const incrQuestion = (app, isCorrect) => {
  app.data.numAsked += 1;
  if (isCorrect) {
    app.data.numCorrect += 1;
  }
}

const pickNewQuestion = app => {
  /** @type {AppData} */
  const countries = Object.keys(country_map);
  let index = Math.floor(Math.random() * countries.length);
  app.data.country = Object.keys(country_map)[index];
}

const numCorrectMsg = (numCorrect, numAsked) => {
  return `You got ${numCorrect} of ${numAsked} questions right.`
}

const nextQuestionMsg = (app) => {
  return `Now, what is the capital of ${app.data.country}?`
}

// TODO: recognize any city answer, not just capitals
exports.capitalGame = functions.https.onRequest((request, response) => {
  const app = new App({request, response});
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));

// c. The function that generates the silly name
  function verifyCapital (app) {
    let guess = app.getArgument(CAPITAL_ARGUMENT);
    console.log("Guess was ", guess);
    let country = app.data.country;
    let capital = country_map[country];
    let reply;
    if (guess === capital) {
      reply = `Correct, the capital of ${country} is ${capital}.`;
      incrQuestion(app, true);
    } else {
      reply = `Sorry, that is incorrect. The capital of ${country} is ${capital}.`;
      incrQuestion(app, false);
    }
    pickNewQuestion(app);
    reply += ' ' + numCorrectMsg(app.data.numCorrect, app.data.numAsked);
    reply += ' ' + nextQuestionMsg(app);
    app.ask(reply);
  };

  function pickCountry (app) {
    const data = initData(app);
    let desc = `Welcome to Capital Guesser. We'll ask you about country
      capitals around the world.
      Your first question is: what is the capital of ${data.country}?`;
    app.ask(desc);
  };

  function giveUp (app) {
    let country = app.data.country;
    let capital = country_map[country];

    let reply = `Ok, here is the answer: The capital of ${country} is ${capital}.`
    incrQuestion(app, false);
    pickNewQuestion(app);
    reply += ' ' + numCorrectMsg(app.data.numCorrect, app.data.numAsked);
    reply += ' ' + nextQuestionMsg(app);
    app.ask(reply);
  };

  function endGame (app) {
    const results = numCorrectMsg(app.data.numCorrect, app.data.numAsked);
    app.tell(`OK, thanks for playing! ` + results)
  };

  app.handleRequest(new Map([
    [CHECK_CAPITAL_ACTION, verifyCapital],
    [WELCOME_ACTION, pickCountry],
    [GIVE_UP_ACTION, giveUp],
    [END_GAME_ACTION, endGame]
  ]));
});
