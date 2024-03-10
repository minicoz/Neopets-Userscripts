// ==UserScript==
// @name           Neopets : Altador Cup : Improved Results
// @namespace      https://gm.wesley.eti.br/neopets
// @description    Improves Schedule/Results page
// @author         w35l3y
// @email          w35l3y@brasnet.org
// @copyright      2011+, w35l3y (https://gm.wesley.eti.br)
// @license        GNU GPL
// @homepage       https://gm.wesley.eti.br
// @version        1.0.1.0
// @language       en
// @include        https://www.neopets.com/altador/colosseum/schedule.phtml?day=all*
// @include        https://www.neopets.com/altador/colosseum/schedule.phtml?day=finals*
// @grant          GM_addStyle
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_xmlhttpRequest
// @grant          GM_getResourceText
// @icon           https://gm.wesley.eti.br/icon.php?desc=105950
// @resource       meta https://github.com/w35l3y/userscripts/raw/master/backup/105950.user.js
// @resource       i18n https://github.com/w35l3y/userscripts/raw/master/includes/Includes_I18n/resources/default.json
// @require        https://github.com/w35l3y/userscripts/raw/master/includes/Includes_XPath/63808.user.js
// @require        https://github.com/w35l3y/userscripts/raw/master/includes/Includes_Translate/85618.user.js
// @require        https://github.com/w35l3y/userscripts/raw/master/includes/Includes_I18n/87940.user.js
// @require        https://github.com/w35l3y/userscripts/raw/master/includes/Includes_Updater/87942.user.js
// @history        1.0.1.0 Fixed final matches
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
  var games = {},
    last_date,
    tmpstyle = "spacing: 0px;margin: 0px;padding: 0px;border: 0px;",
    updateRow = function (params) {
      var row = games[params.key];
      if (!row.done)
        for (var ai = params.game.cells.length - 1, at = 1; ai > at; --ai) {
          var content = row.cells[ai].cloneNode(true),
            t = document.createElement("table"),
            img = xpath(".//img", content)[0];

          content.setAttribute("style", tmpstyle + "height:50px;width:50px;");
          content.removeAttribute("class");

          row.cells[ai].setAttribute(
            "class",
            "logo-bg" + (ai == 5 ? " right-border" : "")
          );
          row.cells[ai].setAttribute("style", "background-color: #FFFFFF");
          while (row.cells[ai].firstChild) {
            row.cells[ai].removeChild(row.cells[ai].firstChild);
          }

          t.setAttribute(
            "style",
            tmpstyle +
              "width: 100%;border-collapse: collapse;text-align: center"
          );
          t.appendChild(document.createElement("tr"));
          if (img) {
            t.firstChild.appendChild(document.createElement("td"));
            if (/results\/([wld])/.test(img.src)) {
              t.firstChild.firstChild.setAttribute("class", RegExp.$1 + "-box");
            }
            t.firstChild.firstChild.setAttribute(
              "style",
              tmpstyle + "width: 50%;height: 45px;"
            );
            t.firstChild.firstChild.appendChild(img);
          }
          if (params.game.cells[ai]) {
            var img2 = xpath(".//img", params.game.cells[ai])[0];
            if (!img || (img && img2.src != img.src)) {
              params.game.cells[ai].removeAttribute("class");
              t.firstChild.insertBefore(
                document.createElement("td"),
                t.firstChild.firstChild
              );
              var tmpstyle2 = tmpstyle;

              if (img) {
                if (/\/(?:win|lose|draw|dummy)\./.test(img.src)) {
                  img.removeAttribute("width");
                  img.setAttribute("height", 22);
                }
                if (/results\/([wld])/.test(img2.src)) {
                  img2.removeAttribute("width");
                  img2.setAttribute("height", 22);
                  t.firstChild.firstChild.setAttribute(
                    "class",
                    RegExp.$1 + "-box"
                  );
                }

                tmpstyle2 +=
                  "width: 50%;height: 55px;border-right: 1px #000000 solid";
              }

              t.firstChild.firstChild.setAttribute("style", tmpstyle2);
              t.firstChild.firstChild.appendChild(img2);
            }
          }

          row.cells[ai].appendChild(t);
        }
      row.done = true;
      row.cells[0].innerHTML += "<br />" + params.game.cells[0].textContent;
    };

  xpath("id('schedule')//tr[position()>1]/td[2]").forEach(function (game) {
    var key = xpath(".//img[contains(@src, 'logo')]", game)
        .map(function (a) {
          return ("00" + a.getAttribute("onclick").match(/\d+/)).substr(-2);
        })
        .sort()
        .join(),
      date = game.parentNode.firstElementChild;

    if (!last_date || date.getAttribute("class") == "team-date") {
      last_date = date;
    } else {
      game.parentNode.replaceChild(last_date.cloneNode(true), date);
    }

    if (key in games) {
      updateRow({
        game: game.parentNode.cloneNode(true),
        key: key,
      });
    } else {
      games[key] = xpath("./ancestor::tr[1]", game)[0];
    }
  });

  var removed = false;
  xpath("id('schedule')//tr[position()>1]").forEach(function (game) {
    if (
      games.some(function (row) {
        if (row == game) {
          if (removed) {
            row.cells[0].setAttribute("style", "background-color: #BBCCFF");
          }
          return true;
        }
        return false;
      })
    ) {
      removed = true;
      game.parentNode.removeChild(game);
    }
  });

  last_date = null;
  xpath("id('schedule')//tr[position()>1]").forEach(function (game) {
    var date = xpath("./*[text()]", game.cells[0])[0];
    if (!last_date || last_date.textContent != date.textContent) {
      last_date = date;
    } else {
      date.parentNode.setAttribute("class", "team-date-no-top-border");
      date.parentNode.removeChild(date.previousElementSibling);
      date.parentNode.removeChild(date);
    }
  });
})();
