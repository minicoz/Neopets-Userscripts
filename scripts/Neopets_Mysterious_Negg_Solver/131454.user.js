// ==UserScript==
// @name           Neopets : Mysterious Negg Solver
// @namespace      https://gm.wesley.eti.br
// @description    Solves the puzzle Mysterious Negg
// @author         w35l3y
// @email          w35l3y@brasnet.org
// @copyright      2012+, w35l3y (https://gm.wesley.eti.br)
// @license        GNU GPL
// @homepage       https://gm.wesley.eti.br
// @version        2.0.2
// @language       en
// @include        https://www.neopets.com/neggfest/y14/negg.phtml
// @include        https://www.neopets.com/shenkuu/neggcave/
// @include        https://www.neopets.com/shenkuu/neggcave/index.phtml
// @grant          GM_addStyle
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_openInTab
// @grant          GM_deleteValue
// @grant          GM_xmlhttpRequest
// @icon           https://gm.wesley.eti.br/icon.php?desc=131454
// @require        https://images.neopets.com/js/jquery-1.7.1.min.js?v=1
// @require        ../../backup/144996.user.js
// @require        ../../includes/Includes_Neopets_Neggbreaker/142688.user.js
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

if ("/neggfest/y14/negg.phtml" == location.pathname) {
  var negg = unsafeWindow.NFNegg;

  negg.watch("currentGrid", function (name, ovalue, nvalue) {
    if (0 <= nvalue && nvalue <= 2) {
      var parchment_id = parseInt(
        /-s(\d+)/.test($("#nfn-negg-symbol-" + nvalue).attr("class")) &&
          RegExp.$1,
        10
      );

      negg.showParchment(parchment_id);

      if (!negg.gridsSolved[nvalue]) {
        Neggbreaker.solver({
          clues: "#nfn-parch-clues-" + parchment_id,
          cells: "div.nfn-negg-clue-cell",
          negg: negg,
        });
      }
    }

    return nvalue;
  });
} else if (!$("img[src $= '/negg_final.jpg']").length) {
  Neggbreaker.solver({
    clues: "#mnc_parch_clues",
    cells: "div.mnc_negg_clue_cell",
    negg: unsafeWindow.NeggCave,
  });
}
