// ==UserScript==
// @name           Neopets : Underwater Fishing
// @namespace      https://gm.wesley.eti.br/neopets
// @description    Reels in your line for all your pets
// @author         w35l3y
// @email          w35l3y@brasnet.org
// @copyright      2012+, w35l3y (https://gm.wesley.eti.br)
// @license        GNU GPL
// @homepage       https://gm.wesley.eti.br
// @version        4.0.1
// @language       en
// @include        https://www.neopets.com/water/fishing.phtml
// @include        https://www.neopets.com/quickref.phtml
// @icon           https://gm.wesley.eti.br/icon.php?desc=34126
// @connect        github.com
// @connect        raw.githubusercontent.com
// @grant          GM_addStyle
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_xmlhttpRequest
// @grant          GM_getResourceText
// @resource       meta https://github.com/w35l3y/userscripts/raw/master/scripts/Neopets_Underwater_Fishing/34126.user.js
// @resource       i18n ../../includes/Includes_I18n/resources/default.json
// @resource       updaterWindowHtml ../../includes/Includes_Updater/resources/default.html
// @resource       updaterWindowCss ../../includes/Includes_Updater/resources/default.css
// @require        ../../includes/Includes_XPath/63808.user.js
// @require        ../../includes/Includes_HttpRequest/56489.user.js
// @require        ../../includes/Includes_Translate/85618.user.js
// @require        ../../includes/Includes_I18n/87940.user.js
// @require        ../../includes/Includes_Updater/87942.user.js
// @uso:version    version
// @history        4.0.0 Added <a href="https://userscripts.org/guides/773">Includes Checker</a>
// @history        3.0.0.0 Updated @require#87942
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
  var user = {
      interval: JSON.parse(GM_getValue("interval", "[3000, 1000]")),
      disable: JSON.parse(GM_getValue("disable", "[]")),
    },
    script = {
      firstPet: GM_getValue("firstPet", ""),
      currentPet: xpath(
        "string(.//tr[1]/td/a[contains(@href, 'quickref')]/b/text())"
      ),
      nextPet: GM_getValue("nextPet", ""),
    };

  function nextAction(f) {
    setTimeout(
      f,
      user.interval[0] + Math.floor(Math.random() * user.interval[1])
    );
  }

  if (/\/water\/fishing\.phtml$/.test(location.href)) {
    var reelIn = xpath(".//input[@name='go_fish']")[0];
    if (script.firstPet) {
      if (reelIn) {
        nextAction(function () {
          reelIn.form.submit();
        });
      } else if (script.currentPet == script.firstPet) {
        GM_deleteValue("firstPet");
        GM_deleteValue("nextPet");
      } else if (script.nextPet) {
        nextAction(function () {
          location.replace(
            "https://www.neopets.com/process_changepet.phtml?new_active_pet=" +
              script.nextPet
          );
        });
      }
    } else {
      GM_setValue("firstPet", script.currentPet);
      GM_deleteValue("nextPet");

      nextAction(function () {
        location.replace("https://www.neopets.com/quickref.phtml");
      });
    }
  } else if (script.firstPet) {
    var arr_pets = [],
      pets = xpath("id('nav')/tbody/tr/td/a/img"),
      nextPet = -1;
    for (var ai = 0, at = pets.length; ai < at; ++ai) {
      var found = false;
      for (var pet in user.disable) {
        if (user.disable[pet] == pets[ai].title) {
          found = true;
          break;
        }
      }
      if (!found) {
        if (pets[ai].title == script.currentPet) {
          nextPet = 1 + ai;
        }
        arr_pets.push(pets[ai].title);
      }
    }

    if (~nextPet) {
      GM_setValue(
        "nextPet",
        (nextPet = arr_pets[nextPet % (at = arr_pets.length)])
      );

      if (script.nextPet || at == 1) {
        nextAction(function () {
          location.replace("https://www.neopets.com/water/fishing.phtml");
        });
      } else {
        nextAction(function () {
          location.replace(
            "https://www.neopets.com/process_changepet.phtml?new_active_pet=" +
              nextPet
          );
        });
      }
    } else {
      GM_deleteValue("firstPet");
      GM_deleteValue("nextPet");
    }
  }
})();
