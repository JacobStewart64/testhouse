class testhouse {
    constructor() {
        this.testmap = {};
        this.numfail = 0;
        this.numpass = 0;
        this.expect = undefined;
        this.BADCOLOR = "\x1b[41m\x1b[33m";
        this.GOODCOLOR = "\x1b[42m\x1b[34m";
        this.RESETCOLOR = "\x1b[37m\x1b[40m";
        this.testnamewidth = 29;
        this.maxtestdigits = 6;
        this.onebased = 1;
        this.testnumpadchar = '0';
        this.testnamepadchar = '~';

        this.expected = (val) => {
            if (val) {
                this.expect = val;
                return undefined;
            }
            return this.expect;
        };

        this.test = (name, bool) => {
            this.testmap[name] = bool;
            if (bool) {
                this.numpass++;
                return;
            }
            this.numfail++;
            return;
        };

        this.currentColors = (test) => {
            return this.testmap[test] ? this.GOODCOLOR : this.BADCOLOR;
        }

        this.lastColors = () => {
            return this.numfail ? this.BADCOLOR : this.GOODCOLOR;
        }

        this.passorfail = (bool) => {
            return bool ? 'PASSED' : 'FAILED';
        }

        this.setTestsZeroBased = () => {
            this.onebased = 0;
        }

        this.logtests = () => {
            Object.keys(this.testmap).forEach((test, i) => {
                //log for each test
                console.log(
                    this.currentColors(test)+'TEST '+((i+this.onebased)+':').padStart(this.maxtestdigits,
                    this.testnumpadchar),
                    test.padEnd(this.testnamewidth,
                    this.testnamepadchar),
                    this.passorfail(this.testmap[test]));
            });
            //final log!
            console.log(
                this.lastColors()+this.numpass+'/'+(this.numpass+this.numfail),
                'passed'+this.RESETCOLOR);
        };

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