const fs = require('fs');
const { performance } = require('perf_hooks');

const BADCOLOR = "\x1b[41m\x1b[33m";
const GOODCOLOR = "\x1b[42m\x1b[34m";
const RESETCOLOR = "\x1b[37m\x1b[40m";
const TIMECOLOR = "\x1b[45m\x1b[36m";
const turns = [
    'testinfo', 
    'expected', 
    'comparator',
    'test'
];
let LAZYINIT = true;
let testnamewidth = 29;
let maxtestdigits = 6;
let onebased = 1;
let testnumpadchar = '0';
let testnamepadchar = '~';
let numpass = 0;
let numfail = 0;
let whoseturn = 0;
let testdata = {};

removeComments = (datastr) => {
    //to do
}

addLineNumsToTestMap = (testmap, code) => {
    //to do
}

getTestNameFromLineNum = (testmap, linenum) => {
    //to do
}

resolveException = (testmap, data, linenum) => {
    const codewithoutcomments = removeComments(data.toString()); //preserves '\n'
    addLineNumsToTestMap(testmap, codewithoutcomments);
    const testname = getTestNameFromLineNum(testmap, linenum);
    console.log(TIMECOLOR+testname+RESETCOLOR);
    actual(testname, undefined);
}

finallog = () => {
    console.log(
        this.lastColors()+this.numpass+'/'+(this.numpass+this.numfail),
        'passed '+TIMECOLOR+' Tests finished '+process.uptime()+'s'+RESETCOLOR);
}

addcurrenttest = () => {
    if (this.testmap[this.name]) {
        throw 'ERROR - DUPLICATE TEST NAMES! THEY MUST BE UNIQUE!';
    }
    this.testmap[this.name] = {
        expect: this.expect,
        doc: this.doc,
        compare: this.compare,
        testfunc: this.testfunc,
        hasrun: false,
        err: undefined
    };
}

stalltillgood = (cb) => {
    const good = this.statictests.every((test) => {
        return this.testmap[test].hasrun;
    });
    if (!good) {
        setTimeout(this.stalltillgood.bind(this, cb), 5);
    }
    else {
        cb();
    }
}

passorfail = (bool) => {
    return bool ? 'PASSED' : 'FAILED';
}

currentColors = (bool) => {
    return  bool ? GOODCOLOR : BADCOLOR;
}

lastColors = () => {
    return this.numfail ? BADCOLOR : GOODCOLOR;
}

setTestsZeroBased = () => {
    this.onebased = 0;
}

setTestNameWidth = (num) => {
    this.testnamewidth = num;
}

setTestDigitsWidth = (num) => {
    this.maxtestdigits = num;
}

setTestNumberPadString = (char) => {
    this.testnumpadchar = char;
}

setTestNamePadString = (char) => {
    this.testnamepadchar = char;
}

class cmpfuncs {
    constructor() {
        this.equals = (expected, actual) => {
            return expected === actual;
        }    
        this.fuzzyequals = (expected, actual) => {
            return expected == actual;
        }        
        this.notequals = (expected, actual) => {
            return expected !== actual;
        }        
        this.fuzzynotequals = (expected, actual) => {
            return expected != actual;
        }        
        this.lessthan = (expected, actual) => {
            return expected < actual;
        }        
        this.lessthanequals = (expected, actual) => {
            return expected <= actual;
        }        
        this.greaterthan = (expected, actual) => {
            return expected > actual;
        }        
        this.greaterthanequals = (expected, actual) => {
            return expected >= actual;
        }
    }
};  

class test {
    constructor(tsuitename) {
        testhousedata[tsuitename].testmap = {};
        testhousedata[tsuitename].numfail = 0;
        testhousedata[tsuitename].numpass = 0;

        this.describe = (name) => {
            if (this.whoseturn !== 0) {
                return this.tellThemWhoseTurnItIs(this.whoseturn, 0);
            }
            testhousedata[tsuitename].name = name;
            this.doc = doc;
            this.whoseturn++;
        }

        this.expected = (val) => {
            if (val) {
                if (this.whoseturn !== 1) {
                    return this.tellThemWhoseTurnItIs(this.whoseturn, 1);
                }
                this.expect = val;
                this.whoseturn++;
                return undefined;
            }
            return this.expect;
        };

        this.comparator = (cb) => {
            if (this.whoseturn !== 2) {
                return this.tellThemWhoseTurnItIs(this.whoseturn, 2);
            }
            this.compare = cb;
            this.whoseturn++;
        }

        this.test = (cb) => {
            if (this.whoseturn !== 3) {
                return this.tellThemWhoseTurnItIs(this.whoseturn, 3);
            }
            this.testfunc = cb;
            this.addcurrenttest();
            this.whoseturn = 0;
            return;
        };

        this.actual = (testname, actual) => {
            try {
                if (typeof testname !== 'string') {
                    throw 'YOU MUST PASS THE SAME TEST NAME YOU NAMED THE TEST WITH AS THE FIRST ARGUMENT TO ACTUAL - YOU PASSED ' + testname;
                }
                if (!this.testmap[testname]) {
                    throw 'YOU MUST PASS THE SAME TEST NAME YOU NAMED THE TEST WITH AS THE FIRST ARGUMENT TO ACTUAL - YOU PASSED ' + testname; 
                }
            }
            catch (e) {
                console.log('EXCEPTION - BAD ARGUMENT TO ACTUAL');
                console.log(e);
                process.exit(1);
            }
            performance.mark(testname+'end');
            const testnameend = testname+'end';
            const perftablename = `${testname} to ${testnameend}`;
            performance.measure(perftablename, testname, testnameend);
            const benchmark = performance.getEntriesByName(perftablename)[0].duration;

            const result = this.testmap[testname].compare(this.testmap[testname].expect, actual);

            if (this.testmap[testname].err) {
                result = false;
            }

            if (result) {
                this.numpass++;
            } else {
                this.numfail++;
            }

            console.log(
                this.currentColors(result)
                +'TEST '
                +(this.onebased++ +':')
                .padStart(this.maxtestdigits, this.testnumpadchar),
                testname.padEnd(this.testnamewidth, this.testnamepadchar),
                this.passorfail(result),
                TIMECOLOR+
                (benchmark.toString().padEnd(11, '0')+'ms').padStart(13)
            );

            if (!result) {
                let elipsis = "";
                if (this.testmap[testname].doc.length > 66) {
                    elipsis = "...";
                }
                console.log(this.currentColors(result)+('DESC '+this.testmap[testname].doc.slice(0, 66)+elipsis).padEnd(74, ' '));
                console.log(('EXPECTED: '+this.testmap[testname].expect+' ACTUAL: '+actual).padEnd(74, ' '));
            }

            if (this.testmap[testname].err) {
                console.log('Exception in test '+testname+'!');
                console.log(this.testmap[testname].err);
            }
            
            this.testmap[testname].hasrun = true;
        }

        this.runtests = () => {
            if (LAZYINIT) {
                this.tests = Object.keys(this.testmap);
                this.statictests = this.tests;
            }
            try {
                while (this.tests.length) {
                    const test = this.tests.shift();
                    performance.mark(test)
                    this.testmap[test].testfunc();
                }           
                stalltillgood(() => {
                    finallog();
                });
            }
            catch (e) {
                const stackframes = e.stack.split('\n');
                owningloop:
                for (let i = 0; i < stackframes.length; i++) {
                    if (stackframes[i].includes('Object.keys.forEach') && stackframes[i].includes('testhouse.js:')) {
                        const beg = stackframes[--i].lastIndexOf('(');
                        const end = stackframes[i].indexOf(':');
                        const pathtoclientcode = stackframes[i].substring(beg+1, end);
                        const linenumend = stackframes[i].lastIndexOf(':');
                        const linenumbeg = stackframes[i].lastIndexOf(':', linenumend - 1);
                        const linenum = stackframes[i].substring(linenumbeg+1, linenumend);
                        if (LAZYINIT) {
                            LAZYINIT = false;
                            fs.readFile(pathtoclientcode, (err, data) => {
                                if (err) return console.log(err);
                                resolveException(this.testmap, data, linenum);
                                break owningloop;
                            });
                        }
                        else {
                            resolveException(this.testmap, data, linenum);
                            break owningloop;
                        }
                    }
                }
            }
        }

        this.getCmpFuncs = () => {
            return new cmpfuncs();
        }
    }
}

module.exports = new testhouse();