chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'install') {
        console.log('Install success');
    } else if (details.reason === 'update') {
        const thisVersion = chrome.runtime.getManifest().version;
        console.log('Updated from ' + details.previousVersion + ' to ' + thisVersion + '!');
    }
});
