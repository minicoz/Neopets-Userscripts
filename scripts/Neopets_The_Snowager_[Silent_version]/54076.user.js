// ==UserScript==
// @name           Neopets : The Snowager [Silent version]
// @namespace      https://gm.wesley.eti.br/neopets
// @description    Silently visit the Snowager
// @author         w35l3y
// @email          w35l3y@brasnet.org
// @copyright      2011+, w35l3y (https://gm.wesley.eti.br)
// @license        GNU GPL
// @homepage       https://gm.wesley.eti.br
// @version        3.1.1
// @language       en
// @include        https://www.neopets.com/*
// @exclude        https://www.neopets.com/colorpallette.phtml
// @exclude        https://www.neopets.com/neomail_block_check.phtml?*
// @exclude        https://www.neopets.com/ads/*
// @exclude        https://www.neopets.com/games/play_flash.phtml?*
// @exclude        https://www.neopets.com/iteminfo.phtml?*
// @icon           https://gm.wesley.eti.br/icon.php?desc=54076
// @connect        github.com
// @connect        raw.githubusercontent.com
// @grant          GM_log
// @grant          GM_addStyle
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_xmlhttpRequest
// @grant          GM_getResourceText
// @resource       i18n ../../includes/Includes_I18n/resources/default.json
// @resource       meta https://github.com/w35l3y/userscripts/raw/master/scripts/Neopets_The_Snowager_%5BSilent_version%5D/54076.user.js
// @resource       updaterWindowHtml ../../includes/Includes_Updater/resources/default.html
// @resource       updaterWindowCss ../../includes/Includes_Updater/resources/default.css
// @resource       messageContainerCss ../../includes/Includes_Message/resources/css/messageContainer.css
// @require        ../../includes/Includes_XPath/63808.user.js
// @require        ../../includes/Includes_Message/main.user.js
// @require        ../../includes/Includes_HttpRequest/56489.user.js
// @require        ../../includes/Includes_Translate/85618.user.js
// @require        ../../includes/Includes_I18n/87940.user.js
// @require        ../../includes/Includes_Updater/87942.user.js
// @require        ../../includes/Includes_Neopets/63810.user.js
// @cfu:version    version
// @history        3.1.0 Changed discontinued @require#54000 to @require#63810
// @history        3.0.0.0 Updated @require#87942
// @history        2.0.0.1 Fixed resource i18n
// @history        2.0.0.2 Added custom interval
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

//GM_setValue("interval", 1);

(function () {
  var doc = Neopets.convert(document),
    usern = doc.Username();

  if (usern)
    (function recursive() {
      // script scope
      const INTERVAL = GM_getValue("interval", 8);

      var key = "Snowager-LastAccess-" + usern,
        curr = doc.Time(true),
        compare = new Date(curr),
        h = curr.getHours(),
        la = new Date(GM_getValue(key, "Sat Apr 02 2011 12:42:02 GMT-0300")),
        sd = new Date(curr);

      compare.setMinutes(0, 0, 0);
      sd.setHours(h + INTERVAL - ((2 + h) % INTERVAL), 0, 30);

      if (la.valueOf() != compare.valueOf() && 0 === (2 + h) % INTERVAL) {
        GM_setValue(key, (la = compare).toString());

        HttpRequest.open({
          method: "get",
          url: "https://www.neopets.com/winter/snowager2.phtml",
          headers: {
            Referer: "https://www.neopets.com/winter/snowager.phtml",
          },
          onsuccess: function (xhr) {
            var msg = xpath(
                ".//td[@class = 'content']//div[@class = 'errormess' and b] | .//td[@class = 'content']//center//b",
                xhr.response.xml
              )[0],
              v = msg ? msg.textContent : "Error " + new Date().toISOString();

            Message.add(['<span class="warn">[The Snowager]</span>', v], {
              error: !msg,
              content: xhr.response.text,
            });
          },
        }).send();
      }

      setTimeout(recursive, sd.valueOf() - curr.valueOf());
    })();
})();
