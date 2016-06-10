// require your nfa/dfa generator libs here
// ex:
// var dfaGen=require('/path/to/dfaGen.js');
// var nfaGen=require('/path/to/nfaGen.js');


/*

Implement the following function to return
a dfa or an nfa.
The function accepts two variables, a type and a tuple.
The type a string of value nfa or dfa.
The tuple consists of:
      tuple.states is an array of states.
      tuple.alphabets is an array of alphabets.
			tuple.delta is a transition function.
      tuple["start-state"] is a single state.
      tuple["final-states"] is an array of states.

You will have to do the work of converting this tuple into a format
that your generator will accept as function arguments. Return either an nfa
or a dfa based on the tuple.
*/
var DFAGenerator = require("../finite-automata/build/src/dfa_generator");
var NFAGenerator = require("../finite-automata/build/src/nfa_generator");

exports.finiteAutomata = function(type,tuple){
    return (type == "dfa") ?
        new DFAGenerator(tuple.states, tuple.alphabets, tuple.delta, tuple["start-state"], tuple["final-states"]).getAutomata() :
        new NFAGenerator(tuple.states, tuple.alphabets, tuple.delta, tuple["start-state"], tuple["final-states"]).getAutomata();
};
