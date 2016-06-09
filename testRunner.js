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

var flag = getFlag(process.argv.slice(3));

var execOptions = {
    "--all-tests": function (data) {
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
        var testIndex = --options[1];
        return run(data, converter, testIndex);
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
    return execOptions[option](data, converter, options);
};

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
};

var shouldExecute = function(flag, type) {
  var shouldExec=true;
  if(flag) {
    shouldExec=(flag==type);
  }
  return shouldExec;
};

var run = function(data, converter, testIndex){
    executeSingleTest = function(dataSet) {
        var type=dataSet.type;
        var tuple=dataSet.tuple;
        if(shouldExecute(flag, type) && converter) {
            var automata = converter(type,tuple);
            console.log(chalk.yellow(util.format("running %s example for %s", dataSet["name"], dataSet["type"])));
            console.log(chalk.yellow("Running for inputs:"));
            return runTestCases(automata, dataSet);
        }

        console.log(chalk.red(util.format("No '%s' test found here", flag)));
    };

    return testIndex ? executeSingleTest(data[testIndex]) : data.forEach(executeSingleTest);
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
  run(JSON.parse(exampleData), automataConverter);
}
