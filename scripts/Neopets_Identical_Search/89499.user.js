// ==UserScript==
// @name           Neopets : Identical Search
// @namespace      https://gm.wesley.eti.br/neopets
// @description    Sets Search Criteria to "Identical"
// @author         w35l3y
// @email          w35l3y@brasnet.org
// @copyright      2013+, w35l3y (https://gm.wesley.eti.br)
// @license        GNU GPL
// @homepage       https://gm.wesley.eti.br
// @version        2.1.2
// @language       en
// @include        https://www.neopets.com/*
// @include        https://ncmall.neopets.com/*
// @grant          GM_log
// @grant          GM_getValue
// @grant          GM_getResourceText
// @icon           https://gm.wesley.eti.br/icon.php?desc=89499
// @require        ../../includes/Includes_XPath/63808.user.js
// @history        2.1.2 Added missing @icon
// @history        2.1.0 Added Includes Checker (due to the recent problems with userscripts.org)
// @noframes
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
  var type = {
      market: 0x01, // wizard
      "island/tradingpost": 0x02, // trading post
      genie: 0x04, // auction
      "portal/supershopwiz": 0x08, // super wizard
    },
    searchType = GM_getValue("search", 0x0f); // wizard + trading post + auction + super wizard

  if (
    (/^\/([\w\/]+)\.phtml/i.test(location.pathname) &&
      searchType & type[RegExp.$1]) ||
    searchType & type["portal/supershopwiz"]
  ) {
    var opts =
      xpath(
        ".//select[contains(@name, 'criteria')]/option[contains(@value, 'exact')]"
      ) || [];

    for (var index in opts) {
      opts[index].selected = true;
    }
  }
})();
