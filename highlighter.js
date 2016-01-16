var audioPlayer = new Audio();
var regex = ""; // global variable cause javascript scope???? just wtf
var highlighted_ids = []; // again global because scope doesn't real
var tagged_ids = [];
var pageVisible = true;
var highlightOnlyInvisible = false;
var highlightTempDisable = false;
var highlightUserLink = false;

audioPlayer.src = chrome.extension.getURL("ping.wav"); // set up audio object

// TODO: update so that buildRegex and updateSettings are only called
//       when we receive a message to say they are updated, save cycles

// find your name in the messages on the screen
var findName = function () {
    buildRegex(); // update the regular expression
    updateSettings(); // update settings
    var messages = document.getElementsByClassName("youWrap"); // messages are contained within a youWrap class div
    var mymessages = document.getElementsByClassName("meWrap");

    for ( i = 0; i < messages.length; i += 1 ) {
        var messageContent = messages[i].innerHTML.replace(/<.+?>/, ""); // remove all html from message
        var messageID = messages[i].parentNode.parentNode.id; // get the unique ID for the message
        if (regex && !~highlighted_ids.indexOf(messageID)) { // ~ inverse indexOf trick to say contains
            if (messageContent.match(regex)) {
                if ((highlightOnlyInvisible && !pageVisible) || !highlightOnlyInvisible) {
                    if (!highlightTempDisable) {
                        audioPlayer.play();
                    }
                }
                highlighted_ids.push(messageID); // add message to highlighted messages
            }
        }
        if (!~tagged_ids.indexOf(messageID) && highlightUserLink) {
            messages[i].innerHTML = messages[i].innerHTML.replace(/[@](.+?)\b/g, '<a href="/$&" data-usercard="$1"><span class="userScreenName">$&</span></a>');
            tagged_ids.push(messageID);
        }
    }
    if (highlightUserLink) {
    for ( i = 0; i < mymessages.length; i += 1 ) {
        var mymessageID = mymessages[i].parentNode.parentNode.id; // get the unique ID for the message
        if (!~tagged_ids.indexOf(mymessageID)) {
            mymessages[i].innerHTML = mymessages[i].innerHTML.replace(/[@](.+?)\b/g, '<a href="/$&" data-usercard="$1"><span class="userScreenName">$&</span></a>');
            tagged_ids.push(mymessageID);
        }
    }
    }
};

// build the regex from chrome storage
var buildRegex = function () {
    chrome.storage.sync.get("highlights", function(result) {
        var list = result.highlights; // get our list of highlights
        var regexS = "\\b("; // begin group

        if (list.length == 0) { 
            regex = ""; // return early if there are no highlights
            return;
        }
        for (i = 0; i < list.length; i +=1 ) {
            regexS += (i == list.length-1) ? list[i] + ")\\b" : list[i] + "|"; // add boundary and close if last word, otherwise use or
        }
        regex = new RegExp(regexS, 'gi'); // construct a regexp object with gi flags, global & case insensitive
    });
}

var updateSettings = function () {
    chrome.storage.sync.get(["tempDisable", "invisHighlight", "userLink"], function (result) {
        highlightTempDisable = result.tempDisable;
        highlightOnlyInvisible = result.invisHighlight;
        highlightUserLink = result.userLink;
    });
}

function handleVisibilityChange() {
    if (document.hidden) {
        pageVisible = false;
    } else  {
        pageVisible = true;
    }
}

document.addEventListener("visibilitychange", handleVisibilityChange, false);
handleVisibilityChange();
console.log("7cups application located"); // woo we loaded
buildRegex(); // build initial regex
updateSettings(); // load settings
findName(); // find name
setInterval(function(){findName()}, 2000); //repeat every 2 seconds
