// ==UserScript==
// @name           Neopets : Plot Prizes Pricer
// @namespace      https://gm.wesley.eti.br/neopets
// @description    Tells the plot prizes that worth to be bought by showing the neopoints per plot point
// @author         w35l3y
// @email          w35l3y@brasnet.org
// @copyright      2013+, w35l3y (https://gm.wesley.eti.br)
// @license        GNU GPL
// @homepage       https://gm.wesley.eti.br
// @version        3.2.0
// @language       en
// @include        https://www.neopets.com/*/prizes.phtml
// @include        https://www.neopets.com/halloween/hwp/shack.phtml
// @include        https://www.neopets.com/mip/prize_shop.phtml
// @include        https://www.neopets.com/desert/ldp/gift_shop.phtml
// @include        https://www.neopets.com/water/com_prizes.phtml
// @include        https://www.neopets.com/altador/colosseum/staff/
// @grant          GM_log
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_openInTab
// @grant          GM_getResourceText
// @grant          GM_xmlhttpRequest
// @icon           https://gm.wesley.eti.br/icon.php?desc=101687
// @connect        jellyneo.net
// @connect        neopets.com
// @connect        github.com
// @connect        raw.githubusercontent.com
// @require        ../../includes/Includes_HttpRequest/56489.user.js
// @require        ../../includes/Includes_XPath/63808.user.js
// @require        ../../includes/Includes_JellyNeo_[BETA]/101685.user.js
// @history        3.0.0 Added <a href="https://userscripts.org/guides/773">Includes Checker</a>
// @history        3.0.0 Added missing @icon
// ==/UserScript==

/*jslint white: true, browser: true, evil: true, forin: true, onevar: true, undef: true */
/*global GM_setValue, GM_getValue, GM_deleteValue: true */
/*global xpath, JellyNeo: true */

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
  var plot = (function () {
      switch (location.pathname) {
        case "/altador/colosseum/2010/prizes.phtml":
          return ["Altador Cup V", 3];
        case "/mip/prize_shop.phtml":
          return ["The Journey to the Lost Isle Plot", 3]; // *
        case "/halloween/hwp/shack.phtml":
          return ["The Haunted Woods Plot", 3];
        case "/desert/ldp/gift_shop.phtml":
          return ["The Lost Desert Plot", 3]; // *
        case "/water/com_prizes.phtml":
          return ["The Curse of Maraqua Plot", 3]; // *
        case "/prehistoric/outskirts/prizes.phtml":
          return ["War for the Obelisk", 3];
        case "/altador/colosseum/staff/":
          return ["Staff Tournament", 0];
      }

      return null;
    })() || [
      /^(?:Neopets - )?(.+?) - Prize/i.test(document.title) && RegExp.$1,
      3,
    ],
    cache = JSON.parse(GM_getValue("cache_" + location.pathname, "{}"));

  function getPoints(node) {
    var texts = xpath(".//text()", node),
      ai,
      at,
      text;

    for (ai = texts.length; ai--; ) {
      text = texts[ai].textContent.replace(/[,.]/g, "");

      if (/^\d+(?:$| point)/i.test(text)) {
        return parseInt(text, 10);
      }
    }

    return false;
  }

  function attachNpRatio(node, point, item) {
    var ratio = document.createElement("span");

    ratio.innerHTML = item.price
      ? '<a target="_blank" href="' +
        item.link +
        '">' +
        item.price +
        " NP</a><br />(" +
        Math.floor((100 * item.price) / point) / 100 +
        " NP/p)<br /><br />"
      : "<br />Unpriced<br /><br />";

    var a = xpath(".//a", node.insertBefore(ratio, node.firstChild))[0];

    if (a) {
      a.addEventListener(
        "click",
        function (e) {
          e.stopPropagation();
        },
        false
      );
    }
  }

  function attachPrices(list, fromCache) {
    var curr = new Date(),
      prizes = xpath(
        ".//td[@class = 'content']//tr/td[(./*/img or ./img or .//div[contains(translate(@class, 'I', 'i'), 'image') and contains(@style, '//images.')]) and .//text()]"
      ),
      items = {},
      fitems = [],
      ai,
      at;

    for (ai in list) {
      if (/\/([^\/]+)\.gif$/.test(list[ai].image)) {
        items[RegExp.$1] = list[ai];
      }
    }

    for (ai = 0, at = prizes.length; ai < at; ++ai) {
      let prize = prizes[ai],
        point = getPoints(prize),
        img =
          /\/([^\/]+)\.gif/.test(
            xpath(
              "string(.//img[1]/@src|.//div[contains(translate(@class, 'I', 'i'), 'image') and contains(@style, '//images.')]/@style)",
              prize
            )
          ) && RegExp.$1;

      if (point && img) {
        if (img in items) {
          // always FALSE because index is ID, not IMAGE
          fitems.push(items[img]);

          attachNpRatio(prize, point, items[img]);
        } else {
          JellyNeo.ItemDatabase.find({
            data: {
              image: "/" + img + ".gif",
            },
            callback: function (obj) {
              var name = "cache_" + location.pathname,
                cache = JSON.parse(GM_getValue(name, "{}")),
                ai;

              if (obj.list.length) {
                attachNpRatio(prize, point, obj.list[0]);

                for (ai = cache.items.length - 1; ai > -1; --ai) {
                  if (cache.items[ai].id === obj.list[0].id) {
                    break;
                  }
                }

                if (~ai) {
                  cache.items[ai] = obj.list[0];
                } else {
                  cache.items.push(obj.list[0]);
                }

                GM_setValue(name, JSON.stringify(cache));
              }
            },
          });
        }
      }
    }

    if (!fromCache) {
      curr.setUTCHours(32, 0, 0, 0);

      GM_setValue(
        "cache_" + location.pathname,
        JSON.stringify({
          date: curr,
          items: fitems,
        })
      );
    }
  }

  if (new Date(cache.date) > new Date()) {
    attachPrices(cache.items, true);
  } else if (plot) {
    JellyNeo.ItemDatabase.find({
      data: {
        scat: [plot[1]],
        notes: plot[0],
      },
      pages: -1,
      callback: function (obj) {
        attachPrices(obj.list, false);
      },
    });
  } else {
    attachPrices([], false);
  }
})();
