// ==UserScript==
// @name           Neopets : Potato Counter
// @namespace      https://gm.wesley.eti.br/neopets
// @description    Plays Potato Counter as much as possible
// @author         w35l3y
// @email          w35l3y@brasnet.org
// @copyright      2012+, w35l3y (https://gm.wesley.eti.br)
// @license        GNU GPL
// @homepage       https://gm.wesley.eti.br
// @version        3.2.0
// @language       en
// @include        https://www.neopets.com/medieval/potatocounter.phtml*
// @grant          GM_addStyle
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_xmlhttpRequest
// @grant          GM_getResourceText
// @icon           https://gm.wesley.eti.br/icon.php?desc=28364
// @resource       meta https://github.com/w35l3y/userscripts/raw/master/backup/28364.user.js
// @resource       i18n https://github.com/w35l3y/userscripts/raw/master/includes/Includes_I18n/resources/default.json
// @resource       updaterWindowHtml https://github.com/w35l3y/userscripts/raw/master/includes/Includes_Updater/resources/default.html
// @resource       updaterWindowCss https://github.com/w35l3y/userscripts/raw/master/includes/Includes_Updater/resources/default.css
// @require        https://github.com/w35l3y/userscripts/raw/master/includes/Includes_XPath/63808.user.js
// @require        https://github.com/w35l3y/userscripts/raw/master/includes/Includes_HttpRequest/56489.user.js
// @require        https://github.com/w35l3y/userscripts/raw/master/includes/Includes_Translate/85618.user.js
// @require        https://github.com/w35l3y/userscripts/raw/master/includes/Includes_I18n/87940.user.js
// @require        https://github.com/w35l3y/userscripts/raw/master/includes/Includes_Updater/87942.user.js
// @cfu:version    version
// @history        3.2.0 Added <a href="https://userscripts-mirror.org/guides/773">Includes Checker</a>
// @history        3.1.0.0 Added limit to 80 potatoes
// @history        3.0.0.0 Updated @require#87942
// @history        2.0.0.1 Fixed required files
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

//GM_setValue("interval", "[5000, 2000]");

(function () {
  // script scope
  var interval = JSON.parse(GM_getValue("interval", "[5000, 2000]")),
    input = xpath(
      ".//form[contains(@action, 'potatocounter.phtml')]/input[@name = 'guess' or @type = 'submit'][1]"
    )[0];

  if (input) {
    setTimeout(
      (function () {
        switch (input.name.toLowerCase()) {
          case "guess": // guess!
            input.value = xpath(
              "count(.//table/tbody/tr/td/img[contains(@src, '/medieval/potato')])"
            );

            if (input.value > 80) {
              return function () {
                alert("Wow! There are too many potatoes.");
              };
            } else {
              return function () {
                input.form.submit();
              };
            }
          default: // play again!
            return function () {
              input.click();
            };
        }
      })(),
      Math.ceil(interval[0] + interval[1] * Math.random())
    );
  }
})();
