// ==UserScript==
// @name           Neopets : Daily Puzzle
// @namespace      https://gm.wesley.eti.br/neopets
// @description    Selects the correct option to Daily Puzzle
// @author         w35l3y
// @email          w35l3y@brasnet.org
// @copyright      2013+, w35l3y (https://gm.wesley.eti.br)
// @license        GNU GPL
// @homepage       https://gm.wesley.eti.br
// @version        4.0.5
// @language       en
// @include        https://www.neopets.com/community/
// @include        https://www.neopets.com/community/index.phtml
// @grant          GM_addStyle
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_xmlhttpRequest
// @grant          GM_getResourceText
// @icon           https://gm.wesley.eti.br/icon.php?desc=28365
// @connect        www.jellyneo.net
// @connect        www.sunnyneo.com
// @connect        github.com
// @connect        raw.githubusercontent.com
// @connect        translate.google.com.br
// @resource       meta https://github.com/w35l3y/userscripts/raw/master/scripts/Neopets_Daily_Puzzle/28365.user.js
// @resource       i18n ../../includes/Includes_I18n/resources/default.json
// @resource       updaterWindowHtml ../../includes/Includes_Updater/resources/default.html
// @resource       updaterWindowCss ../../includes/Includes_Updater/resources/default.css
// @require        ../../includes/Includes_XPath/63808.user.js
// @require        ../../includes/Includes_HttpRequest/56489.user.js
// @require        ../../includes/Includes_Translate/85618.user.js
// @require        ../../includes/Includes_I18n/87940.user.js
// @require        ../../includes/Includes_Updater/87942.user.js
// @cfu:version    version
// @contributor    jellyneo (https://www.jellyneo.net/?go=dailypuzzle)
// @contributor    sunnyneo (https://www.sunnyneo.com/dailypuzzle.php)
// @history        4.0.0 Added <a href="https://userscripts.org/guides/773">Includes Checker</a>
// @history        3.1.0 Changed the order of @require#56489
// @history        3.0.0.0 Updated @require#87942
// @history        2.0.0.1 Added new source (sunnyneo)
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

(function () {
  // script scope
  "use strict";

  var interval = JSON.parse(GM_getValue("interval", "[2000, 1000]")),
    language =
      xpath("string(.//select[@name = 'lang']/option[@selected]/@value)") ||
      "en",
    sources = [
      [
        "https://www.jellyneo.net/?go=dailypuzzle",
        "string(id('contentshell')/div/center/div/span/text())",
      ],
      [
        "https://www.sunnyneo.com/dailypuzzle.php",
        "string(.//table//table//table/tbody/tr[3]/td[2]/b[2]/text())",
      ],
    ];
  (function recursive(list) {
    if (list.length) {
      var source = list.shift();

      HttpRequest.open({
        method: "get",
        url: source[0],
        onsuccess: function (xhr) {
          var answer = xpath(source[1], xhr.response.xml);

          if (answer) {
            Translate.execute(answer, "en", language, function (result) {
              if (
                !xpath(
                  ".//form[input[@name = 'trivia_date']]/select[@name = 'trivia_response']/option[position() > 1]"
                ).some(function (option) {
                  if (
                    ~[
                      result.translation.toLowerCase(),
                      answer.trim().toLowerCase(),
                    ].indexOf(option.textContent.toLowerCase())
                  ) {
                    option.selected = true;

                    window.setTimeout(function () {
                      var f = option.parentNode.form;
                      if (f.submit instanceof Function) f.submit();
                      else f.submit.click();
                    }, interval[0] + Math.floor(interval[1] * Math.random()));

                    return true;
                  }
                  return false;
                })
              ) {
                recursive(list);
              }
            });
          } else {
            recursive(list);
          }
        },
        onerror: function (xhr) {
          recursive(list);
        },
      }).send();
    }
  })(sources);
})();
