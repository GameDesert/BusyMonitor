const hap = require('hap-nodejs');


// #region Homekit Integration
const Accessory = hap.Accessory;
const Service = hap.Service;
const Characteristic = hap.Characteristic;

const tvAccessory = new Accessory('Status Monitor', hap.uuid.generate('Status Monitor'));


const tvService = tvAccessory.addService(Service.Television, 'Status Monitor', 'Television');

const accessoryInfo = tvAccessory.getService(Service.AccessoryInformation);
accessoryInfo.setCharacteristic(Characteristic.Manufacturer, 'OK');
accessoryInfo.setCharacteristic(Characteristic.Model, 'Status Monitor v1');
accessoryInfo.setCharacteristic(Characteristic.SerialNumber, '0001');
accessoryInfo.setCharacteristic(Characteristic.Name, 'Status Monitor');
accessoryInfo.setCharacteristic(Characteristic.FirmwareRevision, '0.1'); 


tvService.setCharacteristic(Characteristic.ConfiguredName, 'Status Monitor');
tvService.setCharacteristic(Characteristic.SleepDiscoveryMode, Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE);


const dndInputService = tvAccessory.addService(Service.InputSource, 'Strict Do Not Disturb', 'Strict Do Not Disturb');
const smsInputService = tvAccessory.addService(Service.InputSource, 'Reading Texts', 'Reading Texts');
const ftsInputService = tvAccessory.addService(Service.InputSource, 'Free To Speak', 'Free To Speak');


dndInputService.setCharacteristic(Characteristic.Identifier, 1);
dndInputService.setCharacteristic(Characteristic.ConfiguredName, 'Strict Do Not Disturb');
dndInputService.setCharacteristic(Characteristic.IsConfigured, Characteristic.IsConfigured.CONFIGURED);
dndInputService.setCharacteristic(Characteristic.InputSourceType, Characteristic.InputSourceType.HDMI);

smsInputService.setCharacteristic(Characteristic.Identifier, 2);
smsInputService.setCharacteristic(Characteristic.ConfiguredName, 'Reading Texts');
smsInputService.setCharacteristic(Characteristic.IsConfigured, Characteristic.IsConfigured.CONFIGURED);
smsInputService.setCharacteristic(Characteristic.InputSourceType, Characteristic.InputSourceType.HDMI);

ftsInputService.setCharacteristic(Characteristic.Identifier, 3);
ftsInputService.setCharacteristic(Characteristic.ConfiguredName, 'Free To Speak');
ftsInputService.setCharacteristic(Characteristic.IsConfigured, Characteristic.IsConfigured.CONFIGURED);
ftsInputService.setCharacteristic(Characteristic.InputSourceType, Characteristic.InputSourceType.HDMI);


tvService.addLinkedService(dndInputService);
tvService.addLinkedService(smsInputService);
tvService.addLinkedService(ftsInputService);


tvService.getCharacteristic(Characteristic.Active).on('set', (value, callback) => {
  if (value) {
    busy();
  } else {
    free();
  }
  callback(null);
});

// Handle input changes
tvService.getCharacteristic(Characteristic.ActiveIdentifier).on('set', (value, callback) => {
  const inputName = getInputName(value);
  change(inputName);
  callback(null);
});


function getInputName(identifier) {
  switch (identifier) {
    case 1:
      return 'Strict Do Not Disturb';
    case 2:
      return 'Reading Texts';
    case 3:
      return 'Free To Speak';
    default:
      return '';
  }
}


function change(inputName) {
  if (inputName == "Strict Do Not Disturb") {
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
  addIdentifyingMaterial: false
});

console.log('Status monitor accessory running on port 47130');
//#endregion

//#region Status Functions
//#endregion