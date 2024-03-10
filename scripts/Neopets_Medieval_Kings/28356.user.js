// ==UserScript==
// @name           Neopets : Medieval Kings
// @namespace      https://gm.wesley.eti.br/neopets
// @description    Selects random options to Medieval Kings
// @author         w35l3y
// @email          w35l3y@brasnet.org
// @copyright      2013+, w35l3y (https://gm.wesley.eti.br)
// @license        GNU GPL
// @homepage       https://gm.wesley.eti.br
// @version        4.0.1
// @language       en
// @include        https://www.neopets.com/medieval/wiseking.phtml
// @include        https://www.neopets.com/medieval/grumpyking.phtml
// @grant          GM_addStyle
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_xmlhttpRequest
// @grant          GM_getResourceText
// @icon           https://gm.wesley.eti.br/icon.php?desc=28356
// @connect        github.com
// @connect        raw.githubusercontent.com
// @resource       meta https://github.com/w35l3y/userscripts/raw/master/scripts/Neopets_Medieval_Kings/28356.user.js
// @resource       i18n ../../includes/Includes_I18n/resources/default.json
// @resource       updaterWindowHtml ../../includes/Includes_Updater/resources/default.html
// @resource       updaterWindowCss ../../includes/Includes_Updater/resources/default.css
// @require        ../../includes/Includes_XPath/63808.user.js
// @require        ../../includes/Includes_HttpRequest/56489.user.js
// @require        ../../includes/Includes_Translate/85618.user.js
// @require        ../../includes/Includes_I18n/87940.user.js
// @require        ../../includes/Includes_Updater/87942.user.js
// @cfu:version    version
// @history        4.0.0 Added <a href="https://userscripts.org/guides/773">Includes Checker</a>
// @history        3.1.0 Added missing @require#56489
// @history        3.1.0 Added option that randomize questions to both kings
// @history        3.0.0.0 Updated @require#87942
// @history        2.0.0.1 Fixed resource i18n
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
  var config = JSON.parse(
      GM_getValue(
        "config",
        JSON.stringify({
          kings: {
            // "What / do / you do if / * / fierce / Pheophins / * / has eaten too much / * / tin of olives"
            grumpy: [3, 8, 6, 1, 39, 118, 1, 32, 1, 143],
          },
          random: 0x01, // 1 = wise, 2 = grumpy, 3 = both
          interval: [8000, 2000],
        })
      )
    ),
    rnd = function (fn) {
      setTimeout(
        fn,
        Math.ceil(config.interval[0] + config.interval[1] * Math.random())
      );
    },
    x = 0,
    opts = xpath("id('qp1')/ancestor::form/descendant::select"),
    cfg =
      /\/(grumpy|wise)king\.phtml$/i.test(location.pathname) &&
      !(
        config.random &
        {
          wise: 1,
          grumpy: 2,
        }[RegExp.$1]
      ) &&
      config.kings[RegExp.$1];

  for (var ai in opts) {
    var opt = opts[ai];

    opt.selectedIndex =
      cfg && cfg[x] > 0
        ? cfg[x++]
        : 1 +
          Math.floor((1000 * opt.length * Math.random()) % (opt.length - 1));
  }

  if (opts.length) {
    rnd(function () {
      opts[0].form.submit();
    });
  }
})();
