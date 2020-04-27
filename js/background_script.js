let lowBatteryNotficationHistory = {}
let userNotifiedForFullCharge = false;

const checkJioFiStatus = () => {
    fetch("http://192.168.1.1/cgi-bin/lget.cgi?&tmpdb=gui_for_web_battery_status,dm_battery_percent&sids=213894", {})
        .then(response => {
            if (!response.ok) {
                return Error(response.statusText)
            }
            return response;
        })
        .then(response => {
            return response.json();
        })
        .then(response => {
            chrome.storage.sync.set({ isConnectedToJioFi: true }, function () {
                const batteryStats = parseBatteryStats(response)
                chrome.storage.sync.set({ batteryStats }, () => { })

                generateNotifications(batteryStats);
            });
        })
        .catch(err => {
            console.log("failure", err);
            chrome.storage.sync.set({ isConnectedToJioFi: false }, function () {
                console.log('Value is set to ' + false);
            });
        })
}

const createAlert = (message, iconUrl) => {
    const options = { type: "basic", title: "JioFi Alert", message, iconUrl }
    chrome.notifications.create('', options);
}

const createLowBatteryAlert = (batteryPercent) => {
    const message = `Battery Low, ${batteryPercent}% remaining, please charge`
    createAlert(message, "../icons/low-battery.png");
    //Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
}

const createFullChargeAlert = () => {
    const message = `Battery charged fully, please remove charger`
    createAlert(message, "../icons/full-battery.png");
}

const BATTERY_STATUS = Object.freeze({
    CHARGING: "Charging",
    DISCHARGING: "Discharging",
    FULL: "Full"
})

const parseBatterStatus = (receivedStatus) => {
    switch (receivedStatus) {
        case "ac": return BATTERY_STATUS.CHARGING
        case "full": return BATTERY_STATUS.FULL
        default: return BATTERY_STATUS.DISCHARGING
    }
}

const parseBatteryStats = (response) => {
    const batteryStats = {}

    batteryStats['status'] = parseBatterStatus(response.gui_for_web_battery_status);
    batteryStats['percent'] = response.dm_battery_percent;

    return batteryStats;
}

const clearLowBatteryNotificationHistory = () => lowBatteryNotficationHistory = {}

const generateNotifications = (batteryStats) => {
    const batteryPercent = parseInt(batteryStats.percent)

    switch (batteryStats.status) {
        case BATTERY_STATUS.CHARGING: {
            clearLowBatteryNotificationHistory();
            break;
        }
        case BATTERY_STATUS.DISCHARGING: {
            if (batteryPercent <= 20 && batteryPercent % 5 === 0) {
                if (!(batteryPercent in lowBatteryNotficationHistory)) {
                    createLowBatteryAlert(batteryPercent);
                    lowBatteryNotficationHistory[batteryPercent] = true;
                }
            }

            userNotifiedForFullCharge = false;
            break;
        }
        case BATTERY_STATUS.FULL: {
            if (!userNotifiedForFullCharge) {
                createFullChargeAlert();
                userNotifiedForFullCharge = true;
            }
            break;
        }
    }

}

checkJioFiStatus();
setInterval(checkJioFiStatus, 15000)
