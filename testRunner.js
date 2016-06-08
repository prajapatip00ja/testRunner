var flag = process.argv[3];

var link = "https://raw.githubusercontent.com/craftybones/examples_json/master/examples.json";
var https = require("https");
var request = https.request;

var automataConverter = require("./"+process.argv[2]).finiteAutometa;
var exampleData = require('./data.json');
var util = require("util");
var chalk = require("chalk");

var runTestCases = function(automata, dataSet) {
  dataSet["pass-cases"].forEach(function(pass_case){
    if(automata(pass_case)) {
      console.log(chalk.green(util.format("%s : pass", pass_case)));
    } else {
      console.log(chalk.bold.red(util.format("%s : fail", pass_case)));
    }
  });

  dataSet["fail-cases"].forEach(function(pass_case){
    if(automata(pass_case)) {
      console.log(chalk.bold.red(util.format("%s : fail", pass_case)));
    } else {
      console.log(chalk.green(util.format("%s : pass", pass_case)));
    }
  });
}

var shouldExecute = function(flag, type) {
  var shouldExec;
  if(!flag) {
    shouldExec = true;
  } else {
      shouldExec = (flag == type);
  }
  return shouldExec;
}

var run = function(data, converter){
  data.forEach(function(dataSet) {
    if(shouldExecute(flag, dataSet["type"])) {
      var automata = converter(dataSet);
      console.log(chalk.yellow(util.format("running %s example for %s", dataSet["name"], dataSet["type"])));
      console.log(chalk.yellow("Running for inputs:"));
      runTestCases(automata, dataSet);
    }
  });
}

run(JSON.parse(exampleData), automataConverter);
