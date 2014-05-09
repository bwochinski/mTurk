// ==UserScript==
// @name         Hugh Hunter - Find image URL
// @version      1.0
// @description  Click the search button to begin. Then simply click on the matching image.
// @copyright    2014+ BenWo (based on work by John Stoehr, Tjololo12)
// ------------------------------------------------------------------------------------
// @match        https://www.mturkcontent.com/dynamic/hit*
// @match        https://www.google.com/search*
// @match        https://www.google.co.uk/search*
// @run-at       document-end
// @downloadURL  
// @updateURL    
// @require      http://code.jquery.com/jquery-2.1.0.js
// @require      http://stevenlevithan.com/demo/parseuri/js/assets/parseuri.js
// ==/UserScript==

// Source: http://stackoverflow.com/a/4673436/2405722
String.prototype.format = function() {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g, function(match, number) {
        return args[number] !== undefined ? args[number] : match;
    });
};

var mturkOrigins = ["https://www.mturkcontent.com/dynamic/hit"];
var googlePrefix="https://www.google.co.uk/search?tbas=0&tbm=isch&tbs=imgo:1,,isz:lt,islt:vga&q=";
                  
var numTasks = 0;

function isMturkOrigin(url) {
    for (var i = 0; i < mturkOrigins.length; ++i) {
        if (url.indexOf(mturkOrigins[i]) === 0) {
            return true;
        }
    }
    
    return false;
}

function sleep(ms) {
    var start = new Date().getTime(), expire = start + ms;
    while (new Date().getTime() < expire) { }
    return;
}

if (isMturkOrigin(location.href) && $("div.panel-body p").text() == "Find a URL to an image for this liquor product:") {
    //console.log($("#mturk_form").find("table:eq(0) tbody tr:eq(1) td:eq(1)"));
    $("#mturk_form").find("table:eq(0) tbody tr:eq(1) td:eq(1)").prepend(
        $("<button></button>", {
            type: "button",
            text: "Search"
        }).click(function() {
            var keywords = $(this).parent().text().substring(6);
            var keywordsEncoded = encodeURIComponent(keywords).replace(/%0A/g, '');
            //console.log(keywords);
            
            sleep(500); //added in rate limiting because issues. Should be virtually un-noticeable.
            window.open("https://www.google.co.uk/search?tbas=0&tbm=isch&tbs=imgo:1,,isz:lt,islt:vga&q={0}&magicword={1}".format(keywordsEncoded, "blarf"));
            
            //console.log("q={0}&magicword={1}".format(keywordsEncoded, "blarf"));
        })
    );

    window.addEventListener("message", function(e) {
        if (e.data.magicword === "blarf") {
            console.log("Message Received");
            console.log(e.data);
            $("#web_url").val(e.data.url);
        } else{
            console.log("MSG "+e.data);
        }
    }, false);
} else if (window.opener != null && window.location.href.indexOf("blarf") > -1) {
    window.opener.postMessage("Child Frame Loaded", "*");
    $('#rg_s div.rg_di a').each(function() {
        var tHref = $(this).attr('href');
        var dHref = decodeURIComponent(tHref);
        
        var refRegex = new RegExp("[\\?&]imgurl=([^&#]*)");
        var pageUrl = refRegex.exec(dHref)[1];
        
        $(this).click(function() {
            window.opener.postMessage({magicword: "blarf", url: pageUrl}, "*");
            //console.log({magicword: "blarf", task: taskNumber, url: pageUrl});
            //sleep(100);
            //window.close();          
        });
    });
}
