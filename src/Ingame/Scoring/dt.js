export default class DT
{
    constructor () {
        this.dts = {};
    }

    start (index) {
        this.dts[index] = new Date().getTime();
    }

    end (index) {
        if (this.dts[index]) {
            this.dts[index] = new Date().getTime() - this.dts[index];
        }
    }

    output () {
        console.log('------ DT OUTPUT ------')
        console.log(this.dts);
    }
}