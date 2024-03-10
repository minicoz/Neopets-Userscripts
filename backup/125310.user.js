// ==UserScript==
// @name           Includes : Neopets : Shop [CONTINUATION]
// @namespace      https://gm.wesley.eti.br
// @author         w35l3y
// @email          w35l3y@brasnet.org
// @copyright      2012+, w35l3y (https://gm.wesley.eti.br)
// @license        GNU GPL
// @homepage       https://gm.wesley.eti.br/includes
// @version        1.0.0.1
// @language       en
// @include        nowhere
// @exclude        *
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_xmlhttpRequest
// @icon           https://gm.wesley.eti.br/icon.php?desc=125310
// @require        https://github.com/w35l3y/userscripts/raw/master/includes/Includes_XPath/63808.user.js
// @require        https://github.com/w35l3y/userscripts/raw/master/includes/Includes_HttpRequest/56489.user.js
// @require        https://github.com/w35l3y/userscripts/raw/master/includes/Includes_Neopets_Shop_Wizard/56503.user.js
// @require        https://github.com/w35l3y/userscripts/raw/master/includes/Includes_Neopets_Shop_[BETA]/56562.user.js
// @require        https://github.com/w35l3y/userscripts/raw/master/includes/Includes_Neopets_Safety_Deposit_Box/56528.user.js
// @require        https://github.com/w35l3y/userscripts/raw/master/backup/63342.user.js
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

//GM_setValue("pin", "");

Shop.check = function (obj) {
  obj.indexes = [0, 0];
  obj.result = {};

  if (!obj.wait) {
    obj.wait = function () {
      return 1000 + Math.floor(500 * Math.random());
    };
  }
  if (!obj.tries) {
    obj.tries = 1;
  }
  if (!obj.data) {
    obj.data = {};
  }

  (function recursive1(obj) {
    console.log("recursive1 " + obj.indexes[0]);
    if (obj.indexes[0] < obj.list.length) {
      (function recursive2(obj) {
        console.log(
          "recursive2 " +
            obj.indexes[1] +
            " (" +
            obj.list[obj.indexes[0]].name +
            ")"
        );
        if (++obj.indexes[1] <= obj.tries) {
          Wizard.find({
            text: obj.list[obj.indexes[0]].name,
            onsuccess: function (params) {
              if (!(obj.list[obj.indexes[0]].name in obj.result)) {
                obj.result[obj.list[obj.indexes[0]].name] = [];
              }

              obj.xhr = params;

              if (params.error) {
                if (obj.indexes[0] == obj.list.length - 1) {
                  obj.indexes[1] = obj.tries;

                  window.setTimeout(recursive2, obj.wait(), obj);
                } else {
                  obj.callback({
                    code: 0x10, // error
                    result: obj,
                  });
                }
              } else {
                Array.prototype.push.apply(
                  obj.result[obj.list[obj.indexes[0]].name],
                  params.list
                );

                if (params.list.length) {
                  console.log(
                    "onsuccess " +
                      params.list[0].Price +
                      " " +
                      params.list[0].Stock
                  );

                  if (10 > params.list[0].Price) {
                    obj.indexes[1] = obj.tries;
                  }
                }

                window.setTimeout(recursive2, obj.wait(), obj);
              }
            },
          });
        } else {
          ++obj.indexes[0];
          obj.indexes[1] = 0;

          recursive1(obj);
        }
      })(obj);
    } else {
      function asc_sort(a, b) {
        if (a[opt] < b[opt]) {
          return -1;
        } else {
          return a[opt] > b[opt] ? 1 : 0;
        }
      }

      function desc_sort(a, b) {
        if (b[opt] < a[opt]) {
          return -1;
        } else {
          return b[opt] > a[opt] ? 1 : 0;
        }
      }

      function filter_by_owner(element, index, array) {
        return index < 1 || element.Owner != array[index - 1].Owner;
      }

      for (var item in obj.result) {
        var opt = "Owner";
        obj.result[item].sort(asc_sort);
        obj.result[item] = obj.result[item].filter(filter_by_owner);
        opt = "Stock";
        obj.result[item].sort(desc_sort);
        opt = "Price";
        obj.result[item].sort(asc_sort);
      }

      if (obj.buy) {
        var total = 0,
          np = xpath(
            "string(id('npanchor')/text())",
            obj.xhr.response.xml
          ).replace(/\D+/g, "");

        obj.list.forEach(function (item) {
          if (!item.quantity) {
            item.quantity = 1;
          }

          if (obj.result[item.name].length) {
            total +=
              item.quantity *
              (obj.result[item.name][2].Price ||
                obj.result[item.name][1].Price ||
                obj.result[item.name][0].Price ||
                1000);
          }
        });

        console.log("total " + total);
        console.log(obj);

        var items = JSON.parse(GM_getValue("items", "{}")),
          sum_price = function (a, b) {
            return a + b.Price;
          },
          sum_stock = function (a, b) {
            return a + b.Stock;
          },
          sdb = [{}, []];

        obj.result.forEach(function (item) {
          if (item.length) {
            items[item[0].Item] = {
              id: item[0].Id,
              prices: {
                min: item[0].Price,
                max: item[item.length - 1].Price,
                avg:
                  item.reduce(sum_price, 0) / (item.reduce(sum_stock, 0) || 1),
              },
            };
          }
        });

        for (var item in obj.list) {
          var o = obj.list[item];
          if (!(o.name in sdb[0])) {
            sdb[0][o.name] = sdb[1].length;
            sdb[1].push([items[o.name].id, 0]);
          }

          sdb[1][sdb[0][o.name]][1] += o.quantity;
        }

        GM_setValue("items", JSON.stringify(items));

        if (total > np || total > obj.limit) {
          obj.callback({
            code: total > np ? 0x08 + (total > obj.limit ? 0x04 : 0) : 0x04,
            result: obj,
          });
        } else {
          SDB.remove({
            items: sdb[1],
            pin: GM_getValue("pin", ""),
            onsuccess: function (params) {
              window.setTimeout(Inventory.list, obj.wait(), {
                onsuccess: function (params) {
                  params.list.forEach(function (item) {
                    if (item.Name in sdb[0]) {
                      for (var x in obj.list) {
                        if (obj.list[x].name == item.Name) {
                          --obj.list[x].quantity;
                          console.log(item.Name);

                          if (obj.list[x].quantity < 0) {
                            //delete obj.list[x];
                            obj.list[x].quantity = 0;
                          }
                        }
                      }
                    }
                  });

                  window.setTimeout(
                    function (obj) {
                      obj.indexes = [0, 0];

                      (function recursive3(obj) {
                        console.log("recursive3 " + obj.indexes[0]);
                        if (obj.indexes[0] < obj.list.length) {
                          (function recursive4(obj) {
                            console.log("recursive4 " + obj.indexes[1]);
                            if (
                              obj.indexes[1] < obj.list[obj.indexes[0]].quantity
                            ) {
                              for (var shopIndex in obj.result[
                                obj.list[obj.indexes[0]].name
                              ]) {
                                var shop =
                                  obj.result[obj.list[obj.indexes[0]].name][
                                    shopIndex
                                  ];

                                if (
                                  shop.Id == obj.list[obj.indexes[0]].id ||
                                  !obj.list[obj.indexes[0]].id
                                ) {
                                  // correct item
                                  delete obj.result[
                                    obj.list[obj.indexes[0]].name
                                  ][shopIndex];

                                  Shop.list({
                                    link: shop.Link,
                                    onsuccess: function recursive5(params) {
                                      console.log(
                                        "recursive5 " + obj.indexes[1]
                                      );
                                      obj.xhr = params;

                                      if (
                                        obj.indexes[1] >=
                                          obj.list[obj.indexes[0]].quantity ||
                                        !params.list.some(function (item) {
                                          if (shop.Id == item.Id) {
                                            ++obj.indexes[1];

                                            window.setTimeout(
                                              Shop.buy,
                                              obj.wait(),
                                              {
                                                link: item.Link,
                                                onsuccess: recursive5,
                                              }
                                            );

                                            return true;
                                          }
                                          return false;
                                        })
                                      ) {
                                        window.setTimeout(
                                          recursive4,
                                          obj.wait(),
                                          obj
                                        );
                                      }
                                    },
                                  });

                                  break;
                                }
                              }
                            } else {
                              // next item
                              ++obj.indexes[0];
                              obj.indexes[1] = 0;

                              recursive3(obj);
                            }
                          })(obj);
                        } else {
                          obj.callback({
                            code: 0x03, // items bought successfully
                            result: obj,
                          });
                        }
                      })(obj);
                    },
                    obj.wait(),
                    obj
                  );
                },
              });
            },
          });
        }
      } else {
        obj.callback({
          code: 0x02, // checked prices successfully
          result: obj,
        });
      }
    }
  })(obj);
};
