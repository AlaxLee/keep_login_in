window.onload = function () {
    loadUrlList(displayStatus)

    var timer = setInterval(function () {
        displayStatus()
    }, 3000);

    // 添加当前tab作为任务
    var add = document.getElementById("add");
    add.onclick = function () {
        addWork()
        // alert("添加当前url成功")
    }

    // 启动任务
    var start = document.getElementById("start");
    start.onclick = function () {
        updateWork(function () {
            keepLoginIn(displayStatus)
        })
        // alert("启动任务成功")
    }

    // 停止任务
    var stop = document.getElementById("stop");
    stop.onclick = function () {

        stopWork(function () {
            keepLoginIn(displayStatus)
        })
        // alert("停止任务成功")
    }

    // 清空任务
    var clear = document.getElementById("clear");
    clear.onclick = function () {

        clearWork(function () {
            keepLoginIn(displayStatus)
        })
        // alert("清空任务成功")
    }

    var test = document.getElementById("test");
    test.onclick = function () {
        refreshUrls()
    }
}

function loadUrlList(callback) {
    // alert("loadUrlList")
    // 从 chrome.storage.local 读出来
    // 存到 textarea 里去
    chrome.storage.local.get(['urllist'], function (result) {
        console.log('urllist value currently is ' + result.urllist);
        if (result.urllist != null) {
            document.getElementById("urllist").value = result.urllist
        }
        if (callback != null) {
            callback()
        }
    });
}

function addWork() {
    var urlList = document.getElementById("urllist").value;
    getCurrentTab(function (tab) {
        if (tab != null) {
            if (tab.url.indexOf("http://") == 0 || tab.url.indexOf("https://") == 0) {
                urlList = urlList.trim() + "\n" + tab.id + ":" + tab.url + "\n"
                document.getElementById("urllist").value = urlList
                chrome.storage.local.set({ 'urllist': urlList }, function () {
                    console.log('urllist value is set to ' + urlList);
                });
            } else {
                alert("只支持 http 和 https")
            }
        }
    })
}

function clearWork(callback) {
    document.getElementById("urllist").value = ""
    chrome.storage.local.remove('urllist', function () {
        console.log('delete urllist');
        if (callback != null) {
            callback();
        }
    })
}


function updateWork(callback) {
    // 重新设置 starttime
    var d = new Date();
    var startTime = d.getTime();
    // 从 textarea 读出待更新的 urllist
    var urlList = document.getElementById("urllist").value;

    chrome.storage.local.set({ 'starttime': startTime, 'urllist': urlList }, function () {
        console.log('urllist value is set to ' + urlList);
        console.log('starttime value is set to ' + startTime);
        if (callback != null) {
            callback();
        }
    });
}


function displayStatus() {
    // 展示任务的执行状况
    chrome.storage.local.get(['starttime', 'lasttime', 'nexttime', 'deadlinetime', 'status'], function (result) {
        console.log('status value currently is ' + result.status);

        var displayString = "任务状态："
        if (result.status == null) {
            displayString += "未开始\n"
        } else {
            displayString += result.status + "\n"
            if (result.status != "未开始") {
                var s = new Date(result.starttime)
                var startTimeString = s.toLocaleString()
                var l = new Date(result.lasttime)
                var lastTimeString = l.toLocaleString()
                var d = new Date(result.deadlinetime)
                var deadlineTimeString = d.toLocaleString()

                displayString +=
                    "开始时间：" + startTimeString + "\n"
                    + "预计结束时间：" + deadlineTimeString + "\n"
                    + "最近一次执行时间：" + lastTimeString + "\n"
                if (result.nexttime <= result.deadlinetime) {
                    var n = new Date(result.nexttime)
                    var nextTimeString = n.toLocaleString()
                    displayString += "预计下一次执行时间：" + nextTimeString
                }
            }
        }

        var x = document.getElementById("displaystatus");
        x.innerText = displayString;
    });
}

function stopWork(callback) {
    // 用设置 starttime 的方式来停止任务
    chrome.storage.local.remove('starttime', function () {
        console.log('delete starttime');
        if (callback != null) {
            callback()
        }
    })
}



function getCurrentTab(callback) {
    chrome.windows.getCurrent(function (currentWindow) {
        chrome.tabs.query({ active: true, windowId: currentWindow.id }, function (tabs) {
            if (callback != null) callback(tabs.length ? tabs[0] : null);
        });
    });
}