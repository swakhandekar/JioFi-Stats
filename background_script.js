let notficationHistory = {}

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
                chrome.storage.sync.set(response, () => { })

                const batteryPercent = parseInt(response.dm_battery_percent)
                const charging = response.gui_for_web_battery_status === 'ac'

                if (charging) notficationHistory = {}

                if (!charging && batteryPercent <= 20 && batteryPercent % 5 === 0) {
                    if (!(batteryPercent in notficationHistory)) {
                        createAlert(batteryPercent);
                        notficationHistory[batteryPercent] = true;
                    }
                }

            });
        })
        .catch(err => {
            console.log("failure", err);
            chrome.storage.sync.set({ isConnectedToJioFi: false }, function () {
                console.log('Value is set to ' + false);
            });
        })
}

const createAlert = (batteryPercent) => {
    const options = {
        type: "basic",
        title: "JioFi Battery",
        message: `Battery Low, ${batteryPercent}% remaining, please charge`,
        iconUrl: "low-battery.png"
        //Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
    }

    chrome.notifications.create('', options);
}

checkJioFiStatus();
setInterval(checkJioFiStatus, 15000)
