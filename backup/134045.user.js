// ==UserScript==
// @name        Neopets : Neopoints
// @namespace   https://gm.wesley.eti.br
// @description Shows the score needed to get 1000 NP
// @author      w35l3y
// @email       w35l3y@brasnet.org
// @copyright   2012+, w35l3y (https://gm.wesley.eti.br)
// @license     GNU GPL
// @homepage    https://gm.wesley.eti.br
// @version     1.0.0.3
// @include     https://www.neopets.com/games/game.phtml?game_id=*
// @grant       GM_log
// @icon        https://gm.wesley.eti.br/icon.php?desc=134045
// @require     https://github.com/w35l3y/userscripts/raw/master/includes/Includes_XPath/63808.user.js
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
  var score = xpath("id('gr-ctp-scores')/div[3]/div[2]")[0];

  if (score)
    score.innerHTML = score.innerHTML.replace(
      /(\d+(?:[,.]\d+)?)/g,
      function ($0, $1) {
        var result = (1000 * parseFloat($1.replace(",", "."))).toFixed();

        if (~$1.indexOf(",")) {
          result = result.replace(".", ",");
        }

        return result;
      }
    );
})();
