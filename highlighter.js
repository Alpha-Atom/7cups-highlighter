var audioPlayer = new Audio();
var regex = "";
var highlighted_ids = [];
var tagged_ids = [];
var pageVisible = true;
var highlightOnlyInvisible = false;
var highlightTempDisable = false;
var highlightUserLink = false;
var firstcheck = true;
var number = 0;

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
    var messageContent = messages[i].innerHTML.replace(/<.+?>/gi, ""); // remove all html from message
    var messageID = messages[i].parentNode.parentNode.id; // get the unique ID for the message
    if (regex && !~highlighted_ids.indexOf(messageID)) { // ~ inverse indexOf trick to say contains
      if (messageContent.match(regex)) {
        if ((highlightOnlyInvisible && !pageVisible) || !highlightOnlyInvisible) {
          number++;
          if (!highlightTempDisable && !firstcheck) {
            audioPlayer.play();
            var userName = messages[i].parentNode.getElementsByClassName("details");
            if (userName.length > 0) {
              userName = userName[0].getElementsByClassName("userScreenName")[0].innerHTML;
              notifyMe(userName, "Highlighted: " + messageContent);
            }
          }
        }
        highlighted_ids.push(messageID); // add message to highlighted messages
      }
    }
    if (highlightUserLink) {
      if (messages[i].innerHTML.match(/(^|\s)[@].+?\b/g)) {
        messages[i].innerHTML = messages[i].innerHTML.replace(/(^|\s)([@](.+?))\b/g,
                                                              '$1<a target="_blank" href="/$2" data-usercard="$3"><span class="userScreenName">$2</span></a>');
      }
    }
  }
  if (number > 0) {
    firstcheck = false;
  }
  if (highlightUserLink) {
    for ( i = 0; i < mymessages.length; i += 1 ) {
      if (mymessages[i].innerHTML.match(/(^|\s)[@].+?\b/g)) {
        mymessages[i].innerHTML = mymessages[i].innerHTML.replace(/(^|\s)([@](.+?))\b/g,
                                                                  '$1<a target="_blank" href="/$2" data-usercard="$3"><span class="userScreenName">$2</span></a>');
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

// request permission on page load
document.addEventListener('DOMContentLoaded', function () {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
});

function notifyMe(username, text) {
  if (!Notification) {
    alert('Desktop notifications not available in your browser. Try Chromium.');
    return;
  }

  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {
    var notification = new Notification(username, {
      icon: 'https://s3-us-west-2.amazonaws.com/7cupstearesources/img/favicon.png',
      body: text,
    });
  }

}

document.addEventListener("visibilitychange", handleVisibilityChange, false);
handleVisibilityChange();
console.log("7cups application located"); // woo we loaded
buildRegex(); // build initial regex
updateSettings(); // load settings
findName(); // find name
setInterval(function(){findName()}, 2000); //repeat every 2 seconds
