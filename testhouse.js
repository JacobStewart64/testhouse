const fs = require('fs');
const { performance } = require('perf_hooks');

const BADCOLOR = "\x1b[41m\x1b[33m";
const GOODCOLOR = "\x1b[42m\x1b[34m";
const RESETCOLOR = "\x1b[37m\x1b[40m";
const TIMECOLOR = "\x1b[45m\x1b[36m";

class testhouse {
    constructor() {
        this.testmap = {};
        this.numfail = 0;
        this.numpass = 0;
        this.expect = undefined;
        this.testnamewidth = 29;
        this.maxtestdigits = 6;
        this.onebased = 1;
        this.testnumpadchar = '0';
        this.testnamepadchar = '~';
        this.numwaiting = 0;
        this.turns = [
            'expected', 
            'testinfo', 
            'comparator',
            'test'
        ];
        this.whoseturn = 0;
        this.name = undefined;
        this.doc = undefined;
        this.compare = undefined;
        this.testfunc = undefined;
        this.exceptionarray = [];
        this.numexecuted = 0;

        this.tellThemWhoseTurnItIs = (whoseturn, outofturn) => {
            throw `ERROR - CALLING FUNCTIONS OUT OF TURN\nYou tried calling ${this.turns[outofturn]} out of turn, it's ${this.turns[whoseturn]}'s turn!`;
        };

        this.expected = (val) => {
            if (val) {
                if (this.whoseturn !== 0) {
                    return this.tellThemWhoseTurnItIs(this.whoseturn, 0);
                }
                this.expect = val;
                this.whoseturn++;
                return undefined;
            }
            return this.expect;
        };

        this.testinfo = (name, doc) => {
            if (this.whoseturn !== 1) {
                return this.tellThemWhoseTurnItIs(this.whoseturn, 1);
            }
            this.name = name;
            this.doc = doc;
            this.whoseturn++;
        }

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
            performance.mark(testname+'end');
            const testnameend = testname+'end';
            const perftablename = `${testname} to ${testnameend}`;
            performance.measure(perftablename, testname, testnameend);
            const benchmark = performance.getEntriesByName(perftablename)[0].duration;

            const result = this.testmap[testname].compare(this.testmap[testname].expect, actual);

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
                (benchmark.toString().padEnd(8, '0')+'ms').padStart(13)
            );

            if (!result) {
                let elipsis = "";
                if (this.testmap[testname].doc.length > 66) {
                    elipsis = "...";
                }
                console.log(this.currentColors(result)+('DESC '+this.testmap[testname].doc.slice(0, 66)+elipsis).padEnd(74, ' '));
                console.log(('EXPECTED: '+this.testmap[testname].expect+' ACTUAL: '+actual).padEnd(74, ' '));
            }
            
            this.testmap[testname].hasrun = true;
            this.numexecuted++;
        }

        this.runtests = () => {
            try {
                if (!this.keys) {
                    this.keys = Object.keys(this.testmap);
                }
                

               this.keys.forEach((test) => {
                    if (!this.testmap[test].hasbeenexecuted) {
                        this.testmap[test].hasbeenexecuted = true;
                        performance.mark(test);
                        this.testmap[test].testfunc();
                    }
                });

                this.stalltillgood(() => {
                    this.finallog();
                }); 
            }
            catch (e) {
                this.exceptionarray.push(e);
                this.runtests();
            }
        };

        this.finallog = () => {
            console.log(
                this.lastColors()+this.numpass+'/'+(this.numpass+this.numfail),
                'passed '+TIMECOLOR+' Tests finished '+process.uptime()+'s'+RESETCOLOR);

            this.exceptionarray.forEach((e) => {
                console.log('One of your tests threw an exception!');
                console.log(e);
            });
        }

        this.addcurrenttest = () => {
            if (this.testmap[this.name]) {
                throw 'ERROR - DUPLICATE TEST NAMES! THEY MUST BE UNIQUE!';
            }
            this.testmap[this.name] = {
                expect: this.expect,
                doc: this.doc,
                compare: this.compare,
                testfunc: this.testfunc,
                hasrun: false
            };
        }

        this.stalltillgood = (cb) => {
            if (this.keys.length !== (this.numexecuted + this.exceptionarray.length)) {
                setTimeout(this.stalltillgood.bind(this, cb), 5);
            }
            else {
                cb();
            }
        }

        this.passorfail = (bool) => {
            return bool ? 'PASSED' : 'FAILED';
        }

        this.currentColors = (bool) => {
            return  bool ? GOODCOLOR : BADCOLOR;
        }

        this.lastColors = () => {
            return this.numfail ? BADCOLOR : GOODCOLOR;
        }

        this.setTestsZeroBased = () => {
            this.onebased = 0;
        }

        this.setTestNameWidth = (num) => {
            this.testnamewidth = num;
        }

        this.setTestDigitsWidth = (num) => {
            this.maxtestdigits = num;
        }

        this.setTestNumberPadString = (char) => {
            this.testnumpadchar = char;
        }

        this.setTestNamePadString = (char) => {
            this.testnamepadchar = char;
        }
    }
}

module.exports = new testhouse();