const LFT = require("leanft");
const WPF = LFT.WPF;
const StdWin = LFT.StdWin;

class OpenTextMyFlightSampleWindow {
constructor(windowObj) {
this.windowObj = windowObj;
}

agentNameEdit() {
    return this.windowObj.$(
        WPF.Edit({
            objectName: "agentName"
        })
    );
}

passwordEdit() {
    return this.windowObj.$(
        WPF.Edit({
            objectName: "password"
        })
    );
}

fromCityCombo() {
    return this.windowObj.$(
        WPF.ComboBox({
            objectName: "fromCity"
        })
    );
}

toCityCombo() {
    return this.windowObj.$(
        WPF.ComboBox({
            objectName: "toCity"
        })
    );
}

okButton() {
    return this.windowObj.$(
        WPF.Button({
            text: "OK",
            objectName: "okButton"
        })
    );
}

findFlightsButton() {
    return this.windowObj.$(
        WPF.Button({
            text: "FIND FLIGHTS",
            objectName: "FIND FLIGHTS"
        })
    );
}

loginFailedDialog() {
    return LFT.Desktop.$(
        StdWin.Dialog({
            text: "Login Failed",
            nativeClass: "#32770",
            isOwnedWindow: true,
            isChildWindow: false
        })
    );
}

}

class FlightAppModel {
OpenTextMyFlightSample() {
const windowObj = LFT.Desktop.$(
WPF.Window({
fullType: "window",
windowTitleRegExp: "OpenText MyFlight Sample Application"
})
);
return new OpenTextMyFlightSampleWindow(windowObj);
}
}

module.exports = FlightAppModel;