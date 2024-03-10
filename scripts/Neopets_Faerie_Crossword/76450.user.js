// ==UserScript==
// @name           Neopets : Faerie Crossword
// @namespace      https://gm.wesley.eti.br/neopets
// @description    Plays Faerie Crossword
// @author         w35l3y
// @email          w35l3y@brasnet.org
// @copyright      2010+, w35l3y (https://gm.wesley.eti.br)
// @license        GNU GPL
// @homepage       https://gm.wesley.eti.br
// @version        3.0.7
// @language       en
// @include        https://www.neopets.com/games/crossword/*
// @grant          GM_log
// @grant          GM_addStyle
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_xmlhttpRequest
// @grant          GM_getResourceText
// @icon           https://gm.wesley.eti.br/icon.php?desc=76450
// @connect        www.jellyneo.net
// @connect        cluesandanswers.blogspot.com
// @connect        github.com
// @connect        raw.githubusercontent.com
// @connect        translate.google.com.br
// @resource       meta https://github.com/w35l3y/userscripts/raw/master/scripts/Neopets_Faerie_Crossword/76450.user.js
// @resource       i18n ../../includes/Includes_I18n/resources/default.json
// @resource       updaterWindowHtml ../../includes/Includes_Updater/resources/default.html
// @resource       updaterWindowCss ../../includes/Includes_Updater/resources/default.css
// @require        ../../includes/Includes_XPath/63808.user.js
// @require        ../../includes/Includes_Neopets/63810.user.js
// @require        ../../includes/Includes_HttpRequest/56489.user.js
// @require        ../../includes/Includes_Translate/85618.user.js
// @require        ../../includes/Includes_I18n/87940.user.js
// @require        ../../includes/Includes_Updater/87942.user.js
// @contributor    cluesandanswers (https://cluesandanswers.blogspot.com/)
// @contributor    jellyneo (https://www.jellyneo.net/?go=faerie_crossword)
// @history        3.0.0 Added <a href="https://userscripts.org/scripts/show/87942">Updater</a>
// @history        3.0.0 Added <a href="https://userscripts.org/guides/773">Includes Checker</a>
// @history        3.0.0 Added missing @icon
// ==/UserScript==

/**************************************************************************

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

**************************************************************************/

if ("/games/crossword/crossword.phtml" == location.pathname) {
  if (xpath("boolean(id('content')/table/tbody/tr/td[2]//center/center/img)")) {
    GM_deleteValue("crossword");
    GM_deleteValue("status");
    GM_deleteValue("multiple");
  } else {
    var curr = Neopets.convert(document).Time(true),
      last = Date.parse(
        GM_getValue("last", "Wed May 12 2010 00:00:00 GMT-0300")
      );
    curr.setHours(0, 0, 0, 0);
    if (curr - last) {
      GM_setValue("crossword", "[]");
      GM_setValue("last", curr.toString());
    }

    (function recursive(crossword) {
      var status = GM_getValue("status", 0);

      if (crossword.length) {
        var x = crossword.shift(),
          word = xpath("id('content')//form/input[@name = 'x_word']")[0];

        xpath(
          ".//a[starts-with(@onclick, '" + x[0].replace(/,/g, ", ") + "')]"
        )[0].click();

        if (x[1] instanceof Array) {
          var m = JSON.parse(GM_getValue("multiple", "{}"));
          if (x[0] in m) {
            ++m[x[0]];
          } else {
            m[x[0]] = 0;
          }
          m[x[0]] %= x[1].length;
          GM_setValue("multiple", JSON.stringify(m));

          word.value = x[1][m[x[0]]];
        } else {
          word.value = x[1];
        }

        window.setTimeout(function () {
          GM_setValue("crossword", JSON.stringify(crossword));

          word.form.submit();
        }, 4000 + Math.floor(3000 * Math.random()));
      } else {
        var answers = JSON.parse(GM_getValue("answers", "{}")),
          missing = [],
          missing2 = [];
        xpath(
          "id('content')//td[2]//center/table/tbody/tr/td/a[contains(@onclick, 'set_clue')]"
        ).forEach(function (answer) {
          var key = answer.textContent.replace(/^\d+\.|\s+/g, "").toLowerCase(),
            f = answer
              .getAttribute("onclick")
              .replace(/; return false;?$|\s+/g, "");

          if (key in answers) {
            crossword.push([f, answers[key]]);
          } else {
            missing.push(answer.textContent);
            missing2.push([
              /(\d+),(\d+)\)/.test(f) && [RegExp.$1, RegExp.$2],
              key,
            ]);
          }
        });

        if (missing2.length)
          switch (status) {
            case 0:
              HttpRequest.open({
                method: "get",
                url: "https://cluesandanswers.blogspot.com/",
                onsuccess: function (xhr) {
                  var answers = {};
                  xpath(
                    "id('main')//td/blockquote/div/text()",
                    xhr.response.xml
                  ).forEach(function (answer) {
                    if (
                      /^(.+)-(\w+)$/.test(
                        answer.textContent.replace(/\s+/g, "")
                      ) &&
                      !(RegExp.$1 in answers)
                    ) {
                      var qq = [RegExp.$1.toLowerCase()],
                        a = RegExp.$2.toUpperCase(),
                        x = qq[0].replace(/[.;]$/, "");
                      if (!~qq.indexOf(x)) {
                        qq.push(x);
                      }

                      qq.forEach(function (q) {
                        if (q in answers) {
                          if (answers[q] instanceof Array) {
                            if (!~answers[q].indexOf(a)) {
                              answers[q].push(a);
                            }
                          } else {
                            answers[q] = [answers[q], a];
                          }
                        } else {
                          answers[q] = a;
                        }
                      });
                    }
                  });

                  HttpRequest.open({
                    method: "get",
                    url: "https://www.jellyneo.net/?go=faerie_crossword",
                    onsuccess: function (xhr) {
                      var xx = {},
                        n = 0,
                        s = "a"; // across
                      xpath(
                        "id('contentshell')//div[@class = 'article']/text()[contains(., '. ')]",
                        xhr.response.xml
                      ).forEach(function (x) {
                        if (/(\d+)\. (.+)/.test(x.textContent)) {
                          var nn = parseInt(RegExp.$1, 10);
                          if (nn < n) {
                            s = "d"; // down
                          }
                          n = nn;
                          xx[s + nn] = RegExp.$2.toUpperCase();
                        }
                      });

                      var tanswers = {};

                      if (
                        !missing2.some(function (n) {
                          var q = n[1],
                            i = (n[0][0] == 1 ? "a" : "d") + n[0][1];
                          if (!(q in answers)) {
                            if (i in xx) {
                              tanswers[q] = xx[i];
                            } else {
                              return true;
                            }
                          }
                          return false;
                        })
                      ) {
                        for (var answer in tanswers) {
                          answers[answer] = tanswers[answer];
                        }
                      }

                      GM_setValue("answers", JSON.stringify(answers));

                      GM_setValue("status", 1);

                      recursive([]);
                    },
                  }).send();
                },
              }).send();
              break;
            case 1:
              if (
                GM_getValue("always_continue", false) ||
                confirm(
                  "[Neopets : Faerie Crossword]\n\nSome answers are missing:\n+ " +
                    missing.join("\n+ ") +
                    "\n\nContinue?"
                )
              ) {
                GM_setValue("status", 2);

                recursive(crossword);
              } else {
                GM_deleteValue("crossword");
                GM_deleteValue("status");
              }
              break;
            case 2:
              alert(
                "[Neopets : Faerie Crossword]\n\nSome answers are missing:\n+ " +
                  missing.join("\n+ ")
              );
              if (!GM_getValue("always_alert", true)) GM_setValue("status", 3);
              break;
          }
        else {
          recursive(crossword);
        }
      }
    })(JSON.parse(GM_getValue("crossword", "[]")));
  }
} else {
  GM_deleteValue("status");

  xpath(
    ".//form[contains(@action, 'crossword.phtml')]/input[@type = 'submit']"
  )[0].form.submit();
}
