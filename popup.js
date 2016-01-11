// populate list from chrome storage
var fillList = function () {
    chrome.storage.sync.get("highlights", function (result) {
        var list = result.highlights;

        var div = document.getElementById("list"); 
        div.innerHTML = "";
        if (!list) {
            return; // do nothing, if no elements in the list
        }

        for (i = 0; i < list.length; i++) {
            div.innerHTML = div.innerHTML + "<li>" + list[i] + 
            " <a href='#' id='" + list[i] + "'>[x]</a></li>"; // create a list element, with a delete button
        }

        for (i = 0; i < list.length; i++) {
            var listItem = list[i];
            document.getElementById(listItem).addEventListener("click", clearOne); // add the event listeners
            //                                                                        to the delete button for
            //                                                                        some unknown fucking reason
            //                                                                        this has to be in a different
            //                                                                        loop
        }
    }); 
}

// clear the entire list, mostly a debug thing but why not leave in prod
var clearList = function () {
    chrome.storage.sync.set({'highlights': []}, completeStorageSet);
    fillList(); //update the list
}

var clearOne = function ( event ) {
    clearWord = event.target.id; // delete the target of the click event
    chrome.storage.sync.get("highlights", function (result) {
        var list = result.highlights;
        var idx  = list.indexOf(clearWord);
        console.log(clearWord);

        if (idx > -1) {
            list.splice(idx, 1); // splice out the word we're deleting
        }
        chrome.storage.sync.set({'highlights': list}, completeStorageSet); // save the new list
    });
}

// add a new word to the highlight list
var addToList = function () {
    var newh = document.getElementById("hA").value;

    chrome.storage.sync.get("highlights", function (result) {
        var list = result.highlights;

        if (!list) {
            list = []; // ensure we have something to indexof
        }

        if (!~list.indexOf(newh)) { // ~ inverse check to indicate contains 
            list.push(newh); // add the new stuff list 
        }
        chrome.storage.sync.set({'highlights': list}, completeStorageSet); // save new list
    });

    document.getElementById("hA").value = "";
}

// function for indicating completed save
var completeStorageSet = function () {
    console.log("Storage set completed!");
    fillList(); // always refill the list once we're done saving
}

// set up onclick handlers and list fillers
document.getElementById("add").onclick = addToList;
document.getElementById("clear").onclick = clearList;
fillList();
