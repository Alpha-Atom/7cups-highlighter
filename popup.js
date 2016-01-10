var fillList = function () {
    chrome.storage.sync.get("highlights", function (result) {
        var list = result.highlights;

        var div = document.getElementById("list");
        div.innerHTML = "";
        if (!list) {
            return;
        }

        for (i = 0; i < list.length; i++) {
            div.innerHTML = div.innerHTML + "<li>" + list[i] + 
            " <a href='#' id='" + list[i] + "'>[x]</a></li>";
        }

        for (i = 0; i < list.length; i++) {
            var listItem = list[i];
            document.getElementById(listItem).addEventListener("click", clearOne);
        }
    }); 
}

var clearList = function () {
    chrome.storage.sync.set({'highlights': []}, completeStorageSet);
    fillList();
}

var clearOne = function ( event ) {
    clearWord = event.target.id;
    chrome.storage.sync.get("highlights", function (result) {
        var list = result.highlights;
        var idx  = list.indexOf(clearWord);
        console.log(clearWord);

        if (idx > -1) {
            list.splice(idx, 1);
        }
        chrome.storage.sync.set({'highlights': list}, completeStorageSet);
    });
}

var addToList = function () {
    var newh = document.getElementById("hA").value;

    chrome.storage.sync.get("highlights", function (result) {
        var list = result.highlights;

        if (!list) {
            list = [];
        }

        if (!~list.indexOf(newh)) {
            list.push(newh);
        }
        chrome.storage.sync.set({'highlights': list}, completeStorageSet);
    });

    document.getElementById("hA").value = "";
}

var completeStorageSet = function () {
    console.log("Storage set completed!");
    fillList();
}

document.getElementById("add").onclick = addToList;
document.getElementById("clear").onclick = clearList;
fillList();
