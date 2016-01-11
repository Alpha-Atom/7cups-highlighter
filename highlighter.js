var audioPlayer = new Audio();
var regex = ""; // global variable cause javascript scope???? just wtf
var highlighted_ids = []; // again global because scope doesn't real

audioPlayer.src = chrome.extension.getURL("ping.wav"); // set up audio object

// find your name in the messages on the screen
var findName = function () {
    buildRegex(); // update the regular expression
    var messages = document.getElementsByClassName("youWrap"); // messages are contained within a youWrap class div

    for ( i = 0; i < messages.length; i += 1 ) {
        var messageContent = messages[i].innerHTML.replace(/<.+?>/, ""); // remove all html from message
        var messageID = messages[i].parentNode.parentNode.id; // get the unique ID for the message
        if (regex && !~highlighted_ids.indexOf(messageID)) { // ~ inverse indexOf trick to say contains
            if (messageContent.match(regex)) {
                audioPlayer.play();
                highlighted_ids.push(messageID); // add message to highlighted messages
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

console.log("7cups application located"); // woo we loaded
buildRegex(); // build initial regex
findName(); // find name
setInterval(function(){findName()}, 2000); //repeat every 2 seconds
