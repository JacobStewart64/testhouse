const fs = require('fs');
const thouse = require('./testhouse.js');
const test = thouse.test;
const expected = thouse.expected;

//read in a file
expected("<fuck>&<fuck>");
const file = fs.readFileSync('./hello.html');
test("Read File:", file.toString() === expected());

//write a file then read it
expected('I wrote this.');
fs.writeFileSync('./dirredfiles/hello.html', expected());
const ourfile = fs.readFileSync('./dirredfiles/hello.html');
test("Write & Read File:", ourfile.toString() === expected());

//guess about stuff
expected(1);
test("Guess about truthiness", '1' == expected());

//configure logs
thouse.setTestDigitsWidth(10);          //default is 6
thouse.setTestNameWidth(50);            //default is 29
thouse.setTestsZeroBased();             //default is 1 based
thouse.setTestNumberPadString('+~+~');  //default is 0
thouse.setTestNamePadString('+~+~');    //default is tilde

//produce nice logs for your tests
thouse.logtests();