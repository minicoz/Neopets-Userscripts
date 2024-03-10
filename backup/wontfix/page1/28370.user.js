// ==UserScript==
// @name           Neopets : Faerie Crossword
// @namespace      https://gm.wesley.eti.br/neopets
// @description    Plays Faerie Crossword
// @author         w35l3y
// @email          w35l3y@brasnet.org
// @version        1.2.4
// @copyright      w35l3y 2008
// @license        GNU GPL
// @homepage       https://www.wesley.eti.br
// @include        https://www.neopets.com/games/crossword/
// @include        https://www.neopets.com/games/crossword/index.phtml
// @include        https://www.neopets.com/games/crossword/crossword.phtml
// @grant          GM_log
// @grant          GM_addStyle
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_openInTab
// @grant          GM_deleteValue
// @grant          GM_xmlhttpRequest
// @icon           https://gm.wesley.eti.br/icon.php?desc=28370
// @require        https://www.wesley.eti.br/includes/js/php.js
// @require        https://www.wesley.eti.br/includes/js/php2js.js
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

checkForUpdate({
  file: "https://github.com/w35l3y/userscripts/raw/master/backup/wontfix/page1/28370.user.js",
  name: "Neopets : Faerie Crossword",
  namespace: "https://gm.wesley.eti.br/neopets",
  version: "1.2.4",
});

(function () {
  // script scope
  var user = {
    interval: GM_getValue("interval", "4000-7000")
      .split("-")
      .array_map(parseInt, array_fill(0, 2, 10)),
    close: GM_getValue("close", true),
  };

  if (/\/crossword\.phtml$/g.test("/" + location.href)) {
    var playAgain = xpath(
      '//form[contains(@action,"crossword.phtml")]/input[@value="Play Again"]'
    )[0];
    if (!!playAgain) {
      // game over
      GM_setValue("position", 0);

      if (user.close) {
        window.close();
      }
    } else {
      // keep playing
      var jsonData = JSON.parse(
        GM_getValue("externalData", '{"response":{"answers":[]}}')
      );
      var currentPosition = GM_getValue("position", 0);

      var entries = jsonData.response.answers;
      if (!!entries) {
        var xans = entries[currentPosition].word;
        var xdir = entries[currentPosition].direction;
        var xnum = entries[currentPosition].number;

        var evtAnswer = xpath(
          'string(//a[@href and contains(@onclick,", ' +
            xdir +
            ", " +
            xnum +
            ');")]/@onclick)'
        ).split(";")[0];
        location.href = "javascript:" + evtAnswer;

        var txtAnswer = xpath(
          '//form[@name = "clueform"]/input[@name = "x_word"]'
        )[0];
        txtAnswer.value = xans;

        setTimeout(function () {
          GM_setValue("position", ++currentPosition);
          txtAnswer.form.submit();
        }, randomValue(user.interval));
      }
    }
  } else {
    // start playing
    resourceText(
      "https://gm.wesley.eti.br/neopets/FaerieCrossword/getAnswer.php?type=json&r=" +
        Math.random(),
      function (r) {
        GM_setValue("externalData", r.responseText);
        GM_setValue("position", 0);

        if (
          JSON.parse(r.responseText).response.updated ||
          confirm("The answer seems not to be updated.\nContinue anyway ?")
        ) {
          var btnStart = xpath(
            '//form[contains(@action,"crossword.phtml")]/input[contains(@value," today\'s puzzle!")]'
          )[0];
          btnStart.form.submit();
        }
      }
    );
  }
})();
