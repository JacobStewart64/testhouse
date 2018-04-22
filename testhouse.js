const fs = require('fs');
const { performance } = require('perf_hooks');
const BADCOLOR = '\x1b[41m\x1b[33m';
const GOODCOLOR = '\x1b[42m\x1b[34m';
const RESETCOLOR = '\x1b[37m\x1b[40m';
const TIMECOLOR = '\x1b[45m\x1b[36m';
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

const removeComments = (datastr) => {
	//to do
};

const addLineNumsToTestMap = (testmap, code) => {
	//to do
};

const getTestNameFromLineNum = (testmap, linenum) => {
	//to do
};

const resolveException = (testmap, data, linenum, actual) => {
	const codewithoutcomments = removeComments(data.toString()); //preserves '\n'
	addLineNumsToTestMap(testmap, codewithoutcomments);
	const testname = getTestNameFromLineNum(testmap, linenum);
	console.log(TIMECOLOR+testname+RESETCOLOR);
	actual(testname, undefined);
};

const cachedResolveException = (testmap, linenum) => {
    const testname = getTestNameFromLineNum(testmap, linenum);
	console.log(TIMECOLOR+testname+RESETCOLOR);
	actual(testname, undefined);
}

const finallog = () => {
	console.log(
		lastColors()+numpass+'/'+(numpass+numfail),
		'passed '+TIMECOLOR+' Tests finished '+process.uptime()+'s'+RESETCOLOR);
};

const addcurrenttest = (tsuite) => {
	testdata[tsuite].testmap[testdata[tsuite].name] = {
		expect: this.expect,
		doc: this.doc,
		compare: this.compare,
		testfunc: this.testfunc,
		hasrun: false,
		err: undefined
	};
};

const stalltillgood = (cb, tsuite) => {
	const good = this.statictests.every((test) => {
		return testdata[tsuite].testmap[test].hasrun;
	});
	if (!good) {
		setTimeout(stalltillgood.bind(this, cb), 5);
	}
	else {
		cb();
	}
};

const passorfail = (bool) => {
	return bool ? 'PASSED' : 'FAILED';
};

const currentColors = (bool) => {
	return  bool ? GOODCOLOR : BADCOLOR;
};

const lastColors = () => {
	return numfail ? BADCOLOR : GOODCOLOR;
};

class cmpfuncs {
	constructor() {
		this.equals = (expected, actual) => {
			return expected === actual;
		};    
		this.fuzzyequals = (expected, actual) => {
			return expected == actual;
		};        
		this.notequals = (expected, actual) => {
			return expected !== actual;
		};        
		this.fuzzynotequals = (expected, actual) => {
			return expected != actual;
		};        
		this.lessthan = (expected, actual) => {
			return expected < actual;
		};        
		this.lessthanequals = (expected, actual) => {
			return expected <= actual;
		};        
		this.greaterthan = (expected, actual) => {
			return expected > actual;
		};        
		this.greaterthanequals = (expected, actual) => {
			return expected >= actual;
		};
	}
}  

class test {
	constructor(tsuite) {
        console.log(TIMECOLOR+tsuite+RESETCOLOR);
		testdata[tsuite].testmap = {};
		testdata[tsuite].numfail = 0;
		testdata[tsuite].numpass = 0;

		this.setup = (name, doc) => {
            testdata[tsuite].name = name;
            testdata[tsuite].testmap[name].doc = doc;
            return this;
        };

		this.expected = (val) => {
            testdata[tsuite].testmap[testdata[tsuite].name].expect = val;
            return this;
		};

		this.comparator = (cb) => {
            testdata[tsuite].testmap[testdata[tsuite].name].compare = cb;
            return this;
		};

		this.test = (cb) => {
			testdata[tsuite].testmap[testdata[tsuite].name].testfunc = cb;
			testdata[tsuite].testmap[testdata[tsuite].name].hasrun = false;
            testdata[tsuite].testmap[testdata[tsuite].name].err = undefined;
            return this;
		};

		this.actual = (testname, actual) => {
			performance.mark(testname+'end');
			const testnameend = testname+'end';
			const perftablename = `${testname} to ${testnameend}`;
			performance.measure(perftablename, testname, testnameend);
			const benchmark = performance.getEntriesByName(perftablename)[0].duration;
			const result = this.testmap[testname].compare(testdata[tsuite].testmap[testname].expect, actual);
			if (testdata[tsuite].testmap[testname].err) {
				result = false;
			}
			if (result) {
                testdata[tsuite].numpass++;
                numpass++;
			} else {
                testdata[tsuite].numfail++;
                numfail++;
			}
			console.log(
				this.currentColors(result)
                +'TEST '
                +(onebased++ +':')
                .padStart(maxtestdigits, testnumpadchar),
				testname.padEnd(testnamewidth, testnamepadchar),
				passorfail(result),
				TIMECOLOR+
                (benchmark.toString().padEnd(11, '0')+'ms').padStart(13)
			);
			if (!result) {
				let elipsis = '';
				if (testdata[tsuite].testmap[testname].doc.length > 66) {
					elipsis = '...';
				}
				console.log(currentColors(result)+('DESC '+testdata[tsuite].testmap[testname].doc.slice(0, 66)+elipsis).padEnd(74, ' '));
				console.log(('EXPECTED: '+testdata[tsuite].testmap[testname].expect+' ACTUAL: '+actual).padEnd(74, ' '));
			}
			if (testdata[tsuite].testmap[testname].err) {
				console.log('Exception in test '+testname+'!');
				console.log(testdata[tsuite].testmap[testname].err);
			}  
			testdata[tsuite].testmap[testname].hasrun = true;
		};

		this.runtests = () => {
			if (LAZYINIT) {
				this.tests = Object.keys(this.testmap);
				this.statictests = this.tests;
			}
			try {
				while (this.tests.length) {
					const test = this.tests.shift();
					performance.mark(test);
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
								resolveException(this.testmap, data, linenum, this.actual);
							});
							break owningloop;
						}
						else {
							cachedResolveException(this.testmap, linenum);
							break owningloop;
						}
					}
				}
			}
        };
        
        this.setTestsZeroBased = () => {
            onebased = 0;
        };
        
        this.setTestNameWidth = (num) => {
            testnamewidth = num;
        };
        
        this.setTestDigitsWidth = (num) => {
            maxtestdigits = num;
        };
        
        this.setTestNumberPadString = (char) => {
            testnumpadchar = char;
        };
        
        this.setTestNamePadString = (char) => {
            testnamepadchar = char;
        };

		this.getCmpFuncs = () => {
			return new cmpfuncs();
		};
	}
}

module.exports = test;