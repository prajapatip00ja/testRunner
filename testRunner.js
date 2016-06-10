var _ = require("lodash");

var automataConverter = require("./"+process.argv[2]).finiteAutomata;
var exampleData = require('./data.json');
var util = require("util");
var chalk = require("chalk");

var getFlag = function (arguments) {
    for(var count = 0; count < arguments.length; count++) {
        if ((arguments[count].toLowerCase() == "nfa") || (arguments[count].toLowerCase() == "dfa"))
            return arguments[count].toLowerCase();
    }
};

var getTestIndex = function (option, data) {
    if(parseInt(option)) {
        return parseInt(option) - 1;
    }

    return _.findIndex(data, ['name', option]);

};

var flag = getFlag(process.argv.slice(3));

var execOptions = {
    "--list": function (data) {
        data.forEach(function (dataSet, index) {
            if(flag && !shouldExecute(flag, dataSet.type)) {
                return;
            }

            var message = chalk.yellow.bold(++index)
                + " - " + chalk.yellow(dataSet.name)
                + " -- " + chalk.red.bold(dataSet.type);
            console.log(message);
        });
    },

    "--only": function (data, converter, options) {
        var testIndex = getTestIndex(options[1], data);
        return run(data, converter, showAllForPassCaseCallback, showAllForFailCaseCallback, testIndex);
    },
    "--fail": function (data, converter, options) {
        return run(data, converter, showOnlyPassCaseCallback, showOnlyFailCaseCallback, undefined);
    },
    "--help": function () {
        var options = require("./options.json");
        Object.keys(options).forEach(function (option) {
            console.log(chalk.cyan.bold(option) + "\n");
            console.log(chalk.white.underline("Description") + "\n\t" + options[option].description);
            console.log(chalk.white.underline("Example") + "\n\t" + options[option].example);
            console.log("\n\n");
        });
    }
};

var optionHandler = function (data, options, converter) {
    var option = options[0];
    if(!execOptions[option]) return console.log("Invalid option. Please check on `node testRunner.js converter.js --help`");
    return execOptions[option](data, converter, options);
};

// Callbacks Start

var showAllForPassCaseCallback = function(dataSet, automata){
    var passCaseCallback = function (pass_case) {
        if(automata(pass_case)) {
            console.log(chalk.green(util.format("%s : pass", pass_case)));
        } else {
            console.log(chalk.bold.red(util.format("%s : fail", pass_case)));
        }
    };

    var failedTests = dataSet["pass-cases"].filter(passCaseCallback);
    return failedTests.length == 0;
};

var showAllForFailCaseCallback = function(dataSet, automata){
    var failCaseCallback = function (pass_case) {
        if(automata(pass_case)) {
            console.log(chalk.bold.red(util.format("%s : fail", pass_case)));
            return true;
        } else {
            console.log(chalk.green(util.format("%s : pass", pass_case)));
        }
    };

    var failedTests = dataSet["fail-cases"].filter(failCaseCallback);

    return failedTests.length == 0;
};

var showOnlyPassCaseCallback = function (dataSet, automata) {
    var passCaseCallback = function (pass_case) {
        if(!automata(pass_case)) {
            console.log(chalk.bold.red(util.format("%s : fail", pass_case)));
            return true;
        }
    };

    return dataSet["pass-cases"].filter(passCaseCallback).length == 0;
};

var showOnlyFailCaseCallback = function (dataSet, automata) {
    var passCaseCallback = function (pass_case) {
        if(automata(pass_case)) {
            console.log(chalk.bold.red(util.format("%s : fail", pass_case)));
        }
    };

    dataSet["fail-cases"].forEach(passCaseCallback)
};

// Callbacks End

var runTestCases = function(automata, dataSet, passCaseCallback, failCaseCallback) {
    var isFailed = false;
    if(!passCaseCallback(dataSet, automata)) isFailed = true;
    if(!failCaseCallback(dataSet, automata)) isFailed = true;

    return isFailed;
};

var shouldExecute = function(flag, type) {
  var shouldExec=true;
  if(flag) {
    shouldExec=(flag==type);
  }
  return shouldExec;
};

var run = function(data, converter, passCaseCallback, failCaseCallback, testIndex){
    var result = { "passed": 0, "fail": 0 };

    executeSingleTest = function(dataSet) {
        var type=dataSet.type;
        var tuple=dataSet.tuple;
        if(shouldExecute(flag, type) && converter) {
            var automata = converter(type,tuple);
            console.log(chalk.yellow(util.format("running %s example for %s", dataSet["name"], dataSet["type"])));
            console.log(chalk.yellow("Running for inputs:"));
            var isFailed = runTestCases(automata, dataSet, passCaseCallback, failCaseCallback);
            if(isFailed) {
                result.fail++;
            } else {
                result.passed++;
            }
        }
    };

    testIndex ? executeSingleTest(data[testIndex]) : data.forEach(executeSingleTest);
    console.log("\n\n" +
        chalk.green("Passed: " + result.passed) + " " +
        chalk.red("Failed: " + result.fail) + " " +
        chalk.yellow("out of " + (result.fail + result.passed)))
};

var getOptionSet = function (arguments) {
    var set = [];
    var foundOption = false;
    arguments.forEach(function (arg) {
        if(arg.indexOf("--") >= 0 || foundOption) {
            foundOption = true;
            set.push(arg);
        }
    });
    return set;

};

var hasOption = function (optionSet) {
    return optionSet.length > 0;
};

var optionSet = getOptionSet(process.argv.slice(3));

if(hasOption(optionSet)) {
    optionHandler(JSON.parse(exampleData), optionSet, automataConverter)
} else {
  run(JSON.parse(exampleData), automataConverter, showAllForPassCaseCallback, showAllForFailCaseCallback);
}
