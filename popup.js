const getColor = (percent) => {
    if (percent >= 70) return "green";
    else if (percent >= 21) return "blue";
    else return "red"
}

const parseChargingStatus = (chargingStatus) => {
    if (chargingStatus === "ac") return "Charging"
    return "Discharging"
}

const connectedHtml = (percent, chargingStatus) => {
    const color = getColor(percent);
    const chargingStatusText = parseChargingStatus(chargingStatus);

    return (
        `<div class="connected">
            <h1>Connected</h1>
            <div class="battery-info">
            <div class="battery-value ${color}" id='battery-value'>${percent}%</div>
            <div>Remaining</div>
            <div class="charging-status">${chargingStatusText}</div>
            </div>
        </div>`
    );
};

const disconnectedHtml = () => {
    return (
        `<div class="disconnected">
            <h1>Not connected to JioFi</h1>
        </div>`
    )
}

chrome.storage.sync.get(['isConnectedToJioFi'], function (result) {
    if (result.isConnectedToJioFi) {

        chrome.storage.sync.get(['dm_battery_percent', 'gui_for_web_battery_status'], function (result) {
            document.getElementById('container').innerHTML = connectedHtml(result.dm_battery_percent, result.gui_for_web_battery_status);
        });
    }

    else {
        document.getElementById('container').innerHTML = disconnectedHtml();
    }
});