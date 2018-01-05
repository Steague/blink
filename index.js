const Blink1 = require('node-blink1');
const _ = require('lodash');

class PromiseBlink1 extends Blink1 {
    constructor(sn) {
        super(sn);
    }

    version(callback = () => {}) {
        return new Promise(resolve => {
            Blink1.prototype.version.call(this, version => {
                callback.call(this);
                resolve(version);
            });
        });
    }

    fadeToRGB(delay = 0, red, green, blue, index = 0, callback = () => {}) {
        return new Promise(resolve => {
            Blink1.prototype.fadeToRGB.apply(this, [
                delay,
                red,
                green,
                blue,
                index,
                () => {
                    // Pass back RGB state if available
                    this.returnPromiseColor(resolve, callback);
                }
            ]);
        });
    }

    setRGB(red, green, blue, callback = () => {}) {
        return new Promise(resolve => {
            Blink1.prototype.setRGB.apply(this, [
                red,
                green,
                blue,
                () => {
                    // Pass back RGB state if available
                    this.returnPromiseColor(resolve, callback);
                }
            ]);
        });
    }

    returnPromiseColor(resolve, callback) {
        this.version().then((version) => {
            if (version >= 2) {
                callback.call(this, this.rgb(0));
                resolve(this.rgb(0));
                return;
            }
            callback.call(this);
            resolve();
        });
    }

    rgb(index = 0, callback = () => {}) {
        return new Promise(resolve => {
            Blink1.prototype.rgb.apply(this, [
                index,
                (r, g, b) => {
                    callback.call(this);
                    resolve({
                        red   : r,
                        green : g,
                        blue  : b
                    });
                }
            ]);
        });
    }

    off(callback = () => {}) {
        return new Promise(resolve => {
            Blink1.prototype.off.call(this, () => {
                callback.call(this);
                resolve();
            });
        });
    }
}

class Blink {
    constructor() {
        this.on = true;
        this.devices = [];
    }

    initDevices() {
        let deviceSerialNumbers = Blink1.devices();

        _.forEach(deviceSerialNumbers, sn => {
            let device = new PromiseBlink1(sn);
            this.devices.push(device);

            device.version().then(version => {
                console.log("Version", version);
            });
        });

        console.log("Devices connected", this.devices.length);

        this.on = true;

        return this;
    }

    checkForDevices() {
        return this.devices.length;
    }

    fadeToColor(red, green, blue, index = 0, delay = 0) {
        if (this.checkForDevices() == 0) {
            // No devices connected
            return;
        }

        this.devicesDo((device) => {
            device._validateIndex(index);
            return device.fadeToRGB(delay, red, green, blue, index);
        }).then((devicesData) => {
            _.forEach(devicesData, ({red, green, blue}) => {
                console.log("Devices faded.", red, green, blue);
            });
            this.fadeToColor(blue, red, green, 0, 5000);
        });

        return this;
    }

    setRGB(red, green, blue) {
        this.devicesDo((device) => {
            return device.setRGB(red, green, blue);
        }).then((devicesData) => {
            _.forEach(devicesData, ({red, green, blue}) => {
                console.log("Devices set.", red, green, blue);
            });

            // setTimeout(() => {
            //     this.devicesDo((device) => {
            //         return device.off();
            //     }).then((devicesData) => {
            //         _.forEach(devicesData, () => {
            //             console.log("Device off.");
            //         });
            //     });
            // }, 1000);
            // setTimeout(() => {
            //     this.setRGB(blue, red, green);
            // }, 200);
        });

        return this;
    }

    devicesDo(func) {
        return Promise.all(_.map(this.devices, func));
    }
}

let project = new Blink();

project
    .initDevices()
    .fadeToColor(255, 0, 0, 0, 500);
