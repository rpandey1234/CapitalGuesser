'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');

// a. the action name from the make_name Dialogflow intent
const NAME_ACTION = 'verify_capital';
// b. the parameters that are parsed from the make_name intent
const CAPITAL_ARGUMENT = 'capital';


exports.capitalGame = functions.https.onRequest((request, response) => {
  const app = new App({request, response});
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));


// c. The function that generates the silly name
  function verifyCapital (app) {
    let capital = app.getArgument(CAPITAL_ARGUMENT);
    // app.tell('Alright, you said ' + capital + '! I hope you like it.');
    app.tell('Hello');
  }
  // d. build an action map, which maps intent names to functions
  let actionMap = new Map();
  actionMap.set(NAME_ACTION, verifyCapital);


  app.handleRequest(actionMap);
});
