const checkJioFiStatus = () => {
    fetch("http://192.168.1.1/cgi-bin/lget.cgi?cmd=get_battery_exist&tmpdb=gui_for_web_battery_status,dm_battery_percent&sids=213894", {})
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

                if (!charging && batteryPercent <= 20 && batteryPercent % 5 === 0)
                    alert(`${response.dm_battery_percent} percent battery! please charge`)

            });
        })
        .catch(err => {
            chrome.storage.sync.set({ isConnectedToJioFi: false }, function () {
                console.log('Value is set to ' + false);
            });
        })
}

setInterval(checkJioFiStatus, 15000)