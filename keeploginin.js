var timeLimit = 12 * 60 * 60 * 1000
var keepInterval = 14 * 60 * 1000

function keepLoginIn(callback) {
    // 判断是否在允许的时间范围内，用来防止无法停止而导致无限请求
    chrome.storage.local.get(['starttime'], function (result) {
        if (result.starttime != undefined) {
            var now = new Date
            var nowTime = now.getTime()
            var deadlineTime = result.starttime + timeLimit
            setStatus({ 'deadlinetime': deadlineTime }, callback)

            if (nowTime <= deadlineTime) {
                refreshUrls(function(){
                    nextTime = nowTime + keepInterval
                    setStatus({ 'status': "运行中", 'lasttime': nowTime, 'nexttime': nextTime }, callback)
                })
            } else {
                setStatus({ 'status': "已停止" }, callback)
            }
        } else {
            setStatus({ 'status': "未开始" }, callback)
        }
    });
}


function setStatus(s, callback) {
    chrome.storage.local.set(s, function () {
        console.log('value is set to ' + JSON.stringify(s));
        if (callback != null) {
            callback()
        }
    });
}


function refreshUrls(callback) {
    chrome.storage.local.get(['urllist'], function (result) {
        console.log('urllist value currently is ' + result.urllist);
        if (result.urllist != null) {
            var urls = result.urllist.split("\n");
            for (var i = 0; i < urls.length; i++) {
                url = urls[i].trim();
                if (url != "") {
                    tabId = parseInt(url.split(":")[0]);
                    if (tabId > 0) {
                        chrome.tabs.executeScript(tabId, { code: 'window.location.reload()'})
                    }
                }
            }
            if (callback != null) {
                callback()
            }
        }
    })
}