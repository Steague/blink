const Blink1 = require('node-blink1');
const _ = require('lodash');

class Blink {
    constructor() {
        this.devices = [];
    }

    initDevices() {
        let deviceSerialNumbers = Blink1.devices();

        _.forEach(deviceSerialNumbers, sn => {
            this.devices.push(new Blink1(sn));
        });

        console.log("Devices connected", this.devices.length);

        return this;
    }

    checkForDevices() {
        return this.devices.length;
    }

    // componentToHex(c) {
    //     var hex = c.toString(16);
    //     return hex.length == 1 ? "0" + hex : hex;
    // }
    //
    // rgbToHex(r, g, b) {
    //     return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    // }
    //
    // hexToRgb(hex) {
    //     var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    //     return result ? {
    //         r: parseInt(result[1], 16),
    //         g: parseInt(result[2], 16),
    //         b: parseInt(result[3], 16)
    //     } : null;
    // }

    fadeToColor(r, g, b) {
        if (this.checkForDevices() == 0) {
            // No devices connected
            return;
        }

        _.forEach(this.devices, device => {
            device.fadeToRGB(1000, r, g, b, () => {
                device.rgb((r, g, b) => {
                    //console.log("Color set complete.", r, g, b);
                    // cycle RGB colors
                    this.fadeToColor(b, r, g)
                });
            });
        });
    }
}

let project = new Blink();

project
    .initDevices()
    .fadeToColor(255, 0, 0);
