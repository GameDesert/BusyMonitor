const hap = require("hap-nodejs");
const express = require("express");

// #region Homekit Integration
const Accessory = hap.Accessory;
const Service = hap.Service;
const Characteristic = hap.Characteristic;

const tvAccessory = new Accessory(
    "Status Monitor",
    hap.uuid.generate("Status Monitor")
);

const tvService = tvAccessory.addService(
    Service.Television,
    "Status Monitor",
    "Television"
);

const accessoryInfo = tvAccessory.getService(Service.AccessoryInformation);
accessoryInfo.setCharacteristic(Characteristic.Manufacturer, "OK");
accessoryInfo.setCharacteristic(Characteristic.Model, "Status Monitor v1");
accessoryInfo.setCharacteristic(Characteristic.SerialNumber, "0001");
accessoryInfo.setCharacteristic(Characteristic.Name, "Status Monitor");
accessoryInfo.setCharacteristic(Characteristic.FirmwareRevision, "0.1");

tvService.setCharacteristic(Characteristic.ConfiguredName, "Status Monitor");
tvService.setCharacteristic(
    Characteristic.SleepDiscoveryMode,
    Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE
);

const dndInputService = tvAccessory.addService(
    Service.InputSource,
    "Do Not Disturb",
    "Do Not Disturb"
);
const smsInputService = tvAccessory.addService(
    Service.InputSource,
    "Reading Texts",
    "Reading Texts"
);
const ftsInputService = tvAccessory.addService(
    Service.InputSource,
    "Free To Speak",
    "Free To Speak"
);

dndInputService.setCharacteristic(Characteristic.Identifier, 1);
dndInputService.setCharacteristic(
    Characteristic.ConfiguredName,
    "Do Not Disturb"
);
dndInputService.setCharacteristic(
    Characteristic.IsConfigured,
    Characteristic.IsConfigured.CONFIGURED
);
dndInputService.setCharacteristic(
    Characteristic.InputSourceType,
    Characteristic.InputSourceType.HDMI
);

smsInputService.setCharacteristic(Characteristic.Identifier, 2);
smsInputService.setCharacteristic(
    Characteristic.ConfiguredName,
    "Reading Texts"
);
smsInputService.setCharacteristic(
    Characteristic.IsConfigured,
    Characteristic.IsConfigured.CONFIGURED
);
smsInputService.setCharacteristic(
    Characteristic.InputSourceType,
    Characteristic.InputSourceType.HDMI
);

ftsInputService.setCharacteristic(Characteristic.Identifier, 3);
ftsInputService.setCharacteristic(
    Characteristic.ConfiguredName,
    "Free To Speak"
);
ftsInputService.setCharacteristic(
    Characteristic.IsConfigured,
    Characteristic.IsConfigured.CONFIGURED
);
ftsInputService.setCharacteristic(
    Characteristic.InputSourceType,
    Characteristic.InputSourceType.HDMI
);

tvService.addLinkedService(dndInputService);
tvService.addLinkedService(smsInputService);
tvService.addLinkedService(ftsInputService);

tvService
    .getCharacteristic(Characteristic.Active)
    .on("set", (value, callback) => {
        if (value) {
            change(
                getInputName(
                    tvService.getCharacteristic(Characteristic.ActiveIdentifier).value
                )
            );
        } else {
            free();
        }
        callback(null);
    });

// Handle input changes
tvService
    .getCharacteristic(Characteristic.ActiveIdentifier)
    .on("set", (value, callback) => {
        const inputName = getInputName(value);
        change(inputName);
        callback(null);
    });

function getInputName(identifier) {
    switch (identifier) {
        case 0:
            return "Do Not Disturb";
        case 1:
            return "Do Not Disturb";
        case 2:
            return "Reading Texts";
        case 3:
            return "Free To Speak";
        default:
            return "";
    }
}

function change(inputName) {
    if (inputName == "Do Not Disturb") {
        dnd();
    } else if (inputName == "Reading Texts") {
        sms();
    } else if (inputName == "Free To Speak") {
        fts();
    } else {
    }
}

tvAccessory.publish({
    username: "1F:EB:4C:DC:2F:5C",
    pincode: "111-11-111",
    port: 47130,
    category: hap.Categories.TELEVISION,
    addIdentifyingMaterial: false,
});

console.log("Status monitor accessory running on port 47130");
//#endregion

//#region Status Functions
let state = "free"; // Or "dnd", "sms", "fts", or "busy" (please don't use busy though, be more specific)

function dnd() {
    state = "dnd";
    console.log("dnd");
}
function sms() {
    state = "sms";
    console.log("sms");
}
function fts() {
    state = "fts";
    console.log("fts");
}
function busy() {
    state = "dnd";
    console.log("busy - dnd");
}
function free() {
    state = "free";
    console.log("free");
}
//#endregion

// #region Express API

const app = express();
const port = 34614;

app.use(express.json());

app.get("/status/api", (req, res) => {
    console.log("GET /status/api called");
    res.send(state);
});

app.post("/status/api", (req, res) => {
    console.log("POST /status/api called with body:", req.body, "and query:", req.query);
    const newState = req.query.state || req.body.state || "dnd";
    state = newState;
    console.log("New state set to:", newState);

    try {
        if (newState == "dnd") {
            tvService.setCharacteristic(Characteristic.Active, true);
            tvService.setCharacteristic(Characteristic.ActiveIdentifier, 1);
        } else if (newState == "sms") {
            tvService.setCharacteristic(Characteristic.Active, true);
            tvService.setCharacteristic(Characteristic.ActiveIdentifier, 2);
        } else if (newState == "fts") {
            tvService.setCharacteristic(Characteristic.Active, true);
            tvService.setCharacteristic(Characteristic.ActiveIdentifier, 3);
        } else if (newState == "free") {
            tvService.setCharacteristic(Characteristic.Active, false);
        }
    } catch (error) {
        console.error("Error setting characteristics:", error);
        res.status(500).send("Internal Server Error");
        return;
    }

    res.send(`State updated to: ${newState}`);
});

app.use(express.static("static"));

app.listen(port, () => {
    console.log(`Running on http://localhost:${port}`);
});



// #endregion
