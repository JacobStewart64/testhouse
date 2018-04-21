const fs = require('fs');
const thouse = require('./testhouse.js');
const expected = thouse.expected;
const testinfo = thouse.testinfo;
const comparator = thouse.comparator;
const test = thouse.test;
const actual = thouse.actual;
const cmp = thouse.getCmpFuncs();

/* When you call expected, you are setting up a new test
 * You must call testinfo next and give info about it
 * Then pass your comparator function to comparator()
 * Then write your test code and pass your result to
 * actual(). You can then give a new value to expected
 * which sets up the next test. Every misuse of the API
 * in regards to order of calls throws an error.
 */

/*
//I need testshould() where you write "it should do this"
//I need to make it easy to write tests for the same "unit"
//my logs need work
//my tests are like 30% longer to write but it's so simple
//and flexible... idk, I really like mine and am going
//to use mine lol

testsuitename("Lambda School Precourse Assessment");
testname('helloWorld');
testshould('Should return a string');
expect("string");

comparator((expected, actual) => {
    return expected === actual;
});

test(() => {
    actual(typeof helloWorld());
});
*/

expected('<fuck>&<fuck>');
/* */testinfo(
    'A Hello World Test',                    //the name of the test [MUST PASS TO ACTUAL AS WELL]
     'This is the hello world test doc lol');
/*
testinfo(*/     //the doc
comparator(cmp.equals);                           //you can use the pre-built compare functions or your own
test(() => {                                      //pass your test function to test
    const file = fs.readFileSync('./hello.htm');
    actual('A Hello World Test', file.toString());//make a call to actual in your test code
});                                               //to pass it your test result

//write more tests with the same sequence of commands

//read in a file
expected("<fuck>&<fuck>");
testinfo("Read File:",
    "Read in from a file and check to see if the data arrives correctly");

comparator(() => {
        return true;
});

test(async () => {
    actual("Read File:", "<fuck>&<fuck>");
});


//write a file then read it
expected('I wrote this.');
testinfo("Write & Read File:",
    "Write a string to a file and check and see if we get the same string on the way out");

comparator((expected, actual) => {
    return expected === actual;
});
    
test(async () => {
    fs.writeFile('./dirredfiles/hello.html', 'I wrote this.', function(err) {
        if (err) return console.log(err);
        fs.readFile('./dirredfiles/hello.html', 'utf8', function(err, data) {
            if (err) return console.log(err);
            actual("Write & Read File:", data.toString()); //a common problem for me using the api is forgetting to pass/passing improper test name
        });
    });
});


//test of concurrent reads and writes
for (let i = 0; i < 100; i++) {
    expected('I wrote this.');
    testinfo("TestAsyncRW"+i,
        "Write a string to a file and check and see if we get the same string on the way out");

    comparator((expected, actual) => {
        return expected !== actual;
    });
        
    test(async () => {
        fs.writeFile('./dirredfiles/hello'+i+'.html', 'I wrote this.', function(err) {
            if (err) return console.log(err);
            fs.readFile('./dirredfiles/hello'+i+'.html', 'utf8', function(err, data) {
                if (err) return console.log(err);
                actual("TestAsyncRW"+i, data.toString()); //a common problem for me using the api is forgetting to pass/passing improper test name
            });
        });
    });
}


//guess about stuff
expected(1);
testinfo("Guess about truthiness",
    "Compare String '1' to Number 1");

comparator((expected, actual) => {
    return expected == actual;
});

test(async () => {
    actual("Guess about truthiness", "2");
});

//set your logging and other options
thouse.setTestDigitsWidth(10);          //default is 6
thouse.setTestNameWidth(50);            //default is 29
thouse.setTestsZeroBased();             //default is 1 based
thouse.setTestNumberPadString('+~+~');  //default is 0
thouse.setTestNamePadString('+~+~');    //default is tilde

//you can declare you test functions async if you want
//them to be!

//call runtests and that's it!
thouse.runtests();