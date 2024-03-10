// ==UserScript==
// @name        Includes : Neopets : Shop
// @namespace   https://gm.wesley.eti.br
// @description Shop Function
// @author      w35l3y
// @email       w35l3y@brasnet.org
// @copyright   2015+, w35l3y (https://gm.wesley.eti.br)
// @license     GNU GPL
// @homepage    https://gm.wesley.eti.br
// @version     1.0.2
// @language    en
// @include     nowhere
// @exclude     *
// @grant       GM_xmlhttpRequest
// @grant       GM_getResourceText
// @require     https://github.com/w35l3y/localStorageDB/raw/master/localstoragedb.js
// @require     https://github.com/w35l3y/userscripts/raw/master/includes/Includes_XPath/63808.user.js
// @require     https://github.com/w35l3y/userscripts/raw/master/includes/Includes_HttpRequest/56489.user.js
// @require     https://github.com/w35l3y/userscripts/raw/master/includes/Includes_Neopets_[BETA]/main.user.js
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

var Shop = function (page) {
  var _get = function (url, data, cb, referer) {
    page.request({
      method: "get",
      action: url,
      referer: referer,
      data: data,
      callback: function (obj) {
        obj.items = xpath(
          ".//td[@class = 'content']//td[a[contains(@href, 'buy_item')]/img]/b",
          obj.body
        ).map(function (item) {
          var cell = item.parentNode,
            texts = xpath("../text()[5 < string-length(.)]", item),
            n = function (v) {
              return parseInt(v.replace(/\D+/g, ""), 10);
            },
            link = cell.firstElementChild.href,
            output = {
              id: n(link.match(/obj_info_id=(\d+)/)[1]),
              name: item.textContent.trim(),
              link:
                (link.indexOf("https://")
                  ? "https://www.neopets.com" + ("/" == link[0] ? "" : "/")
                  : "") + link,
              stock: n(texts[0].textContent),
              price: n(texts[1].textContent),
              image: cell.firstElementChild.firstElementChild.src.replace(
                /^http:\/\/images\.neopets\.com\/items\/|\.gif$/g,
                ""
              ),
            };

          if (
            !page.database.update(
              "items",
              {
                id: output.id,
              },
              function (row) {
                row.image = output.image;

                return row;
              }
            )
          ) {
            console.log("Inserting item...", output);
            page.database.insert("items", output);
          }

          return output;
        });

        page.database.commit();

        cb(obj);
      },
    });
  };

  this.browse = function (obj) {
    _get(obj.url, {}, obj.callback, obj.url);
  };

  this.buy = function (obj) {
    if (/obj_info_id=(\d+)&/.test(obj.url)) {
      if (~obj.url.indexOf("buy_item")) {
        if (!obj.referer) {
          if (
            /&owner=(\w+)&obj_info_id=(\d+)&.+?&old_price=(\d+)&/.test(obj.url)
          ) {
            obj.referer =
              "https://www.neopets.com/browseshop.phtml?owner=" +
              RegExp.$1 +
              "&buy_obj_info_id=" +
              RegExp.$2 +
              "&buy_cost_neopoints=" +
              RegExp.$3;
          } else {
            throw "'referer' is required";
          }
        }
        _get(
          obj.url,
          {},
          function (o) {
            var errmsg = xpath(
              "normalize-space(/html/body/center[img[contains(@src, '/pets/sad/')]]/i)",
              o.body
            );
            if (errmsg) {
              o.error = 1;
              o.errmsg = errmsg;
            }

            obj.callback(o);
          },
          obj.referer
        );
      } else {
        var buy_item = RegExp["$&"],
          _this = this;

        _this.browse({
          url: obj.url,
          callback: function (o) {
            for (var ai = 0, at = o.items.length; ai < at; ++ai) {
              var item = o.items[ai];
              if (~item.link.indexOf(buy_item)) {
                obj.referer = obj.url;
                obj.url = item.link;
                _this.buy(obj);
                return;
              }
            }

            o.error = 1;
            o.errmsg = "Item not found!";
            obj.callback(o);
          },
        });
      }
    } else {
      throw "Invalid url (" + obj.url + ")";
    }
  };
};
