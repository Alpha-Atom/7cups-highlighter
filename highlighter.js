var nameCount = 0;
var audioPlayer = new Audio();
var regex = "";
var highlighted_ids = [];

audioPlayer.src = chrome.extension.getURL("ping.wav");

var findName = function () {
    buildRegex();
    var messages = document.getElementsByClassName("youWrap");
    nameCount = 0;

    for ( i = 0; i < messages.length; i += 1 ) {
        var messageContent = messages[i].innerHTML.replace(/<.+?>/, "");
        var messageID = messages[i].parentNode.parentNode.id;
        if (regex && !~highlighted_ids.indexOf(messageID)) {
            if (messageContent.match(regex)) {
                audioPlayer.play();
                highlighted_ids.push(messageID);
            }
        }
    }
};

var buildRegex = function () {
    chrome.storage.sync.get("highlights", function(result) {
        var list = result.highlights;

        if (list.length == 0) {
            regex = "";
            return;
        }

        var regexS = "(";
        for (i = 0; i < list.length; i +=1 ) {
            regexS += (i == list.length-1) ? list[i] + ")\\b" : list[i] + "|";
        }

        regex = new RegExp(regexS, 'gi');
    });
}

console.log("7cups application located");
buildRegex();
findName();
setInterval(function(){findName()}, 2000);
