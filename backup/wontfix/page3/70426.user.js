// ==UserScript==
// @name           Examples of interactions among tabs
// @namespace      https://gm.wesley.eti.br/examples
// @description    Examples of interactions among tabs
// @include        https://translate.google.tld/?sl=auto&tl=pt#userscripts-mirror.org
// @include        https://userscripts-mirror.org/topics/*
// @grant          GM_log
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @icon           https://gm.wesley.eti.br/icon.php?desc=70426
// @require        https://github.com/w35l3y/userscripts/raw/master/includes/Includes_XPath/63808.user.js
// ==/UserScript==

///[ EXAMPLE 1 ]///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

if (location.hostname == "userscripts-mirror.org") {
  xpath("id('post_body')")[0].addEventListener(
    "change",
    function (e) {
      GM_setValue("post_body.text", e.target.value);
    },
    false
  );

  window.addEventListener(
    "unload",
    function (e) {
      GM_deleteValue("post_body.text");
    },
    false
  );
} else if (/^translate\.google\./.test(location.hostname)) {
  function fill(e) {
    var value = GM_getValue("post_body.text");
    if (value) xpath("id('source')")[0].value = value;
  }

  fill(); // first run

  window.addEventListener("focus", fill, false);
}

///[ EXAMPLE 2 ]///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// this should be executed ONCE every minute, even if 2+ tabs are opened at once or in a interval lesser than 1 minute

function every_n_secs(recursive, secs) {
  var current = new Date(),
    ms = Math.max(1000 * secs, 1000),
    lr = new Date(
      Date.parse(GM_getValue("lastRun", "Wed Mar 03 2010 19:18:04 GMT-0300"))
    ); // the default value doesnt really matter, it just should be any time in the past

  if (current - lr > ms) {
    GM_setValue("lastRun", (lr = current).toString());

    recursive(current, lr, ms);
  }

  setTimeout(every_n_secs, ms - (current - lr), recursive, secs);
}

every_n_secs(function (current, last_run, interval) {
  GM_log(current);
}, 60);
