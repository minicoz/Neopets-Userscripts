// ==UserScript==
// @name        Includes : Neopets : PremiumBar
// @namespace   https://gm.wesley.eti.br
// @description PremiumBar Function
// @author      w35l3y
// @email       w35l3y@brasnet.org
// @copyright   2015+, w35l3y (https://gm.wesley.eti.br)
// @license     GNU GPL
// @homepage    https://gm.wesley.eti.br
// @version     1.3.0
// @language    en
// @include     nowhere
// @exclude     *
// @grant       GM_log
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_openInTab
// @grant       GM_deleteValue
// @grant       GM_xmlhttpRequest
// @grant       GM_getResourceURL
// @grant       GM_getResourceText
// @resource    winConfigCss ../../includes/Includes_WinConfig/resources/default.css
// @resource    toolbarCss https://gist.github.com/w35l3y/252ea029821a8b8109fa/raw/toolbar.css
// @resource    toolbarHtml https://gist.github.com/w35l3y/252ea029821a8b8109fa/raw/toolbar.html
// @resource    toolbarStocks https://gist.github.com/w35l3y/252ea029821a8b8109fa/raw/stocks.html
// @resource    cliffhangerAnswers https://gist.github.com/w35l3y/fab231758eb0991f36a0/raw/cliffhanger.txt
// @resource    crosswordAnswers https://gist.github.com/w35l3y/fab231758eb0991f36a0/raw/crossword.json
// @resource    foodclubJson https://gist.github.com/w35l3y/fab231758eb0991f36a0/raw/foodclub.json
// @require     https://gist.github.com/w35l3y/f824897032ae38af9595/raw/main.js
// @require     https://github.com/w35l3y/localStorageDB/raw/master/localstoragedb.js
// @require     https://github.com/w35l3y/github-js/raw/master/lib/underscore-min.js
// @require     https://github.com/w35l3y/github-js/raw/master/github.js
// @require     https://github.com/w35l3y/JSAMF/raw/master/web/web/amf.js
// @require     https://github.com/w35l3y/userscripts/raw/master/includes/Includes_XPath/63808.user.js
// @require     https://github.com/w35l3y/userscripts/raw/master/includes/Includes_Cron_[BETA]/main.user.js
// @require     https://github.com/w35l3y/userscripts/raw/master/includes/Includes_HttpRequest/56489.user.js
// @require     https://github.com/w35l3y/userscripts/raw/master/includes/Includes_Neopets_[BETA]/main.user.js
// @require     https://github.com/w35l3y/userscripts/raw/master/includes/Includes_WinConfig/163374.user.js
// @require     https://github.com/w35l3y/userscripts/raw/master/includes/Includes_Template_[BETA]/176400.user.js
// @require     https://images.neopets.com/js/jquery-1.7.1.min.js
// @require     https://images.neopets.com/js/jquery-ui-1.8.17.min.js
// @require     https://images.neopets.com/js/jquery.ui-1.8.23/ui/jquery.ui.widget.js
// @require     https://images.neopets.com/js/jquery.ui-1.8.23/ui/jquery.ui.mouse.js
// @require     https://images.neopets.com/js/jquery.ui-1.8.23/ui/jquery.ui.sortable.js
// @require     https://gist.github.com/w35l3y/252ea029821a8b8109fa/raw/toolbar.js
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

var main = document.getElementById("main");
if (!main) {
  throw "Content not found. Toolbar rendering skipped.";
}

GM_addStyle(
  ".winConfig_PremiumBarSettings .fieldName_action, .winConfig_PremiumBarSettings .fieldClass_toolbarActivity {float:left;margin-right:2px;width:49%}"
);

var _const = {
    OPEN: 0,
    EXECUTE: 1,
    DISPLAY: 2,
    LOG: 4,

    TAB: 0,
    BG: 1,

    MANUAL: 0,
    AUTO: 1,

    HIDE: 0,
    SHOW: 1,

    ATTACHED: 0,
    DETACHED: 1,
    OFF: 2,

    DEFAULT: 0,
    READY: 1,
    WAITING: 2,
    SUCCESS: 3,
    ERROR: 4,
  },
  colors = ["grey", "cyan", "orange", "lime", "magenta"],
  PremiumBar = function (activities) {
    for (var ai = 0, at = activities.length; ai < at; ++ai) {
      var act = activities[ai];
      if (!act.id) {
        act.id = act.title
          .trim()
          .toLowerCase()
          .replace(/\s+(\w)/g, function ($0, $1) {
            return $1.toUpperCase();
          })
          .replace(/\W+/g, "");
      }
    }

    var customCounter = 0,
      customField = function (_win) {
        var _opts = {},
          changeData = function (e, cb) {
            var t = this.parent.parent.fields[0].elements[0].options;

            for (var ai = 0, at = t.length; ai < at; ++ai) {
              if (t[ai].selected) {
                var act = activities[t[ai].value];
                if (!(act.id in _opts)) {
                  _opts[act.id] = {};
                }
                _opts[act.id][e.target.name] = cb(e.target.value);
              }
            }
          },
          changeText = function (e) {
            changeData.apply(this, [
              e,
              function (v) {
                return v;
              },
            ]);
          },
          changeRadio = function (e) {
            changeData.apply(this, [
              e,
              function (v) {
                return parseInt(v, 10);
              },
            ]);
          },
          tmp = {
            class: "actions",
            type: WinConfig.FieldType.GROUP,
            fields: [
              {
                name: "action",
                type: WinConfig.FieldType.SELECT,
                format: WinConfig.FieldFormat.ARRAY,
                attrs: { rows: 6 },
                multiple: true,
                unique: false,
                events: {
                  change: function (e) {
                    var id = activities[e.target.value].id,
                      o = _opts[id] || this.parent.default[id];

                    this.parent.fields[1].fields[0].elements[
                      1 + (o.type || 0)
                    ].checked = true;
                    this.parent.fields[1].fields[1].elements[
                      1 + (o.auto || 0)
                    ].checked = true;
                    this.parent.fields[1].fields[2].elements[
                      1 + (o.display || 0)
                    ].checked = true;
                    this.parent.fields[1].fields[3].elements[
                      1 + (o.log || 0)
                    ].checked = true;
                    this.parent.fields[1].fields[4].elements[0].value =
                      o.custom || "";
                  },
                },
                value: activities
                  .map(function (v, i) {
                    return {
                      value: i,
                      label: v.title,
                    };
                  })
                  .sort(function (a, b) {
                    return a.label > b.label;
                  }),
              },
              {
                name: "values",
                label: "Settings",
                class: "toolbarActivity",
                type: WinConfig.FieldType.GROUP,
                fields: [
                  {
                    name: "type",
                    label: "Open",
                    type: WinConfig.FieldType.CHECK,
                    format: WinConfig.FieldFormat.NUMBER,
                    default: 0x0,
                    empty: 0x0,
                    //disabled: true,
                    multiple: false,
                    unique: true,
                    nogroup: true,
                    events: {
                      change: changeRadio,
                    },
                    value: [
                      {
                        value: 0x0,
                        label: "Tab",
                      },
                      {
                        value: 0x1,
                        label: "Bg",
                      },
                    ],
                  },
                  {
                    name: "auto",
                    label: "Execute",
                    type: WinConfig.FieldType.CHECK,
                    format: WinConfig.FieldFormat.NUMBER,
                    default: 0x0,
                    empty: 0x0,
                    //disabled: true,
                    multiple: false,
                    unique: true,
                    nogroup: true,
                    events: {
                      change: changeRadio,
                    },
                    value: [
                      {
                        value: 0x0,
                        label: "Manual",
                      },
                      {
                        value: 0x1,
                        label: "Auto",
                      },
                    ],
                  },
                  {
                    name: "display",
                    label: "Display",
                    type: WinConfig.FieldType.CHECK,
                    format: WinConfig.FieldFormat.NUMBER,
                    default: 0x0,
                    empty: 0x0,
                    //disabled: true,
                    multiple: false,
                    unique: true,
                    nogroup: true,
                    events: {
                      change: changeRadio,
                    },
                    value: [
                      {
                        value: 0x0,
                        label: "Hide",
                      },
                      {
                        value: 0x1,
                        label: "Show",
                      },
                    ],
                  },
                  {
                    name: "log",
                    label: "Log",
                    type: WinConfig.FieldType.CHECK,
                    format: WinConfig.FieldFormat.NUMBER,
                    default: 0x0,
                    empty: 0x0,
                    //disabled: true,
                    multiple: false,
                    unique: true,
                    nogroup: true,
                    events: {
                      change: changeRadio,
                    },
                    value: [
                      {
                        value: 0x0,
                        label: "Attach",
                      },
                      {
                        value: 0x1,
                        label: "Detach",
                      },
                      {
                        value: 0x2,
                        label: "Off",
                      },
                    ],
                  },
                  {
                    name: "custom",
                    label: "Custom",
                    help: true,
                    description: "Use it at your own risk",
                    type: WinConfig.FieldType.TEXT,
                    format: WinConfig.FieldFormat.STRING,
                    //disabled: true,
                    multiple: false,
                    nogroup: true,
                    events: {
                      keyup: changeText,
                    },
                  },
                ],
              },
            ],
          };

        for (var ai in tmp) {
          this[ai] = tmp[ai];
        }

        this.getConfig = function () {
          return _opts;
        };
        this.setConfig = function (value) {
          console.log(value);
          _opts = value;
        };
      },
      _activities = {},
      _data = JSON.parse(GM_getValue("premium-data", "{}")),
      _myBar = this,
      myPage = new Neopets(document),
      myWin = new WinConfig({
        title: "Premium Bar : Settings",
        type: WinConfig.WindowType.CUSTOM,
        size: ["480px", 0],
        position: [0, 0],
        fields: [
          {
            name: "settingsHotKey",
            label: "Settings HotKey",
            key: "hotkey",
            callback: function (event, win) {
              win.open();
            },
          },
          {
            default: (function (v) {
              var out = {};

              for (var ai = 0, at = v.length; ai < at; ++ai) {
                var act = v[ai];

                out[act.id] = {
                  type: act.values[0],
                  auto: act.values[1],
                  display: act.values[2],
                  log: act.values[3],
                  custom: "",
                };
              }

              return out;
            })(activities),
            name: "actions",
            label: "Actions",
            key: customField,
          },
        ],
      }),
      myCron = new Cron("neopets", myPage.time),
      storeKey = "storeKey-" + myPage.username,
      Activity = function (obj) {
        obj.parent = this;
        var gistIdKey = "gistId-" + obj.id;
        Object.defineProperties(this, {
          id: {
            value: obj.id,
          },
          gistId: {
            get: function () {
              var id = GM_getValue(gistIdKey);
              if (!id) {
                if (
                  (id = prompt(
                    "[ " +
                      obj.title +
                      " ]\nGist ID:\n\nIf you don't have one, create it here ( https://gist.github.com ) and paste here its id.\nNote: It isn't modifiable, so be careful."
                  ))
                ) {
                  GM_setValue(gistIdKey, /\/(\w+)$/.test(id) ? RegExp.$1 : id);
                } else {
                  throw "Gist ID is required";
                }
              }
              return id;
            },
          },
          bar: {
            value: _myBar,
          },
          price: {
            value: obj.price,
          },
          url: {
            get: function () {
              obj.bar = this.bar;
              var url = obj.url || "https://gist.github.com/" + this.gistId;
              delete obj.bar;
              return url;
            },
          },
        });

        var cfg = myWin.get("actions." + this.id),
          _tasks = [],
          _activity = this,
          nst = function (v) {
            return v
              ? v.toISOString().replace("T", " ").replace("Z", " NST")
              : "";
          },
          _execute = function (auto, cb, event) {
            if (!this.bar.page.loggedIn) {
              this.update({
                color: _const.ERROR,
                message: "You are logged out.",
              });

              console.log("SKIP", "logged out");
              output = true;
            } else if (0 < myPage.np && myPage.np < obj.price) {
              this.update({
                color: _const.ERROR,
                message: "No neopoints",
              });
              output = true;
            } else if (
              (auto && -2 == obj.price) ||
              (!event.ctrlKey &&
                -1 != obj.price &&
                ((cfg && _const.BG == cfg.type) ||
                  (!cfg && _const.BG == obj.values[_const.OPEN])))
            ) {
              console.log("EXEC", _activity.id);
              if (obj.execute) {
                this.update({
                  color: _const.WAITING,
                  message: "Processing...",
                });

                obj.execute.apply(this, [
                  function (o) {
                    var __page = _activity.bar.page;
                    if (!o.error && 0 < obj.price) {
                      __page.np -= obj.price;
                    }
                    if ("counter" in o) {
                      var ct = [].concat(o.counter),
                        counterKey = "counter-" + ct[4] + "-" + _activity.id,
                        dd = __page.time,
                        counter = __page.getUserData(counterKey) || 0;
                      if (ct[5]) {
                        [].concat(ct[5]).forEach(function (i) {
                          __page.deleteUserData(
                            "counter-" + i + "-" + _activity.id
                          );
                        });
                      }

                      console.log(counter, ct);
                      if (ct[0] > ++counter) {
                        console.log(counterKey, ct[0] - counter);
                        __page.setUserData(
                          counterKey,
                          counter,
                          ct[1] || 86400000
                        );

                        if (typeof ct[2] == "function") {
                          ct[2](dd, counter);
                        } else {
                          dd.setUTCMilliseconds(ct[2] || 10000);
                        }
                        o.next = dd;
                      } else {
                        if (ct[3]) {
                          if (typeof ct[3] == "function") {
                            ct[3](dd);
                          } else {
                            dd.setUTCMilliseconds(ct[3]);
                          }
                          o.next = dd;
                        }
                        __page.deleteUserData(counterKey);
                      }
                    }
                    if (cb) {
                      o.next = cb(!o.error, o.next);
                    }
                    _activity.save(o);
                  },
                  auto,
                ]);

                return false;
              } else {
                this.update({
                  color: _const.SUCCESS,
                  message: "Success!",
                });
              }
            } else {
              this.update({
                color: _const.SUCCESS,
                message: "Tab was opened.",
              });

              GM_openInTab(this.url);
            }

            return true;
          };

        this.execute = function (cb, e) {
          if (_tasks.length) {
            for (var ai = 0, at = _tasks.length; ai < at; ++ai) {
              _tasks[ai].execute(cb, e);
            }
          } else {
            _execute.apply(_activity, [false, cb, e]);
          }
        };

        this.log = function (data) {
          GM_setValue(
            storeKey + this.id,
            GM_getValue(storeKey + this.id, "") +
              [
                this.bar.page.time.toISOString(),
                typeof data == "string" ? data : JSON.stringify(data),
              ].join(" ") +
              "\n"
          );
        };

        this.store = function (cb) {
          var files = {},
            _idKey = storeKey + this.id,
            curr =
              this.id +
              " " +
              storeKey.substr(9) +
              " " +
              this.bar.page.time.toISOString();
          files[curr] = {
            content: GM_getValue(_idKey, null),
          };
          console.log(files);

          new Github({
            get token() {
              var id = GM_getValue("oauth");
              if (!id) {
                if (
                  (id = prompt(
                    "GitHub OAUTH TOKEN:\n\nIf you don't have one, then generate it here ( https://github.com/settings/tokens/new ) with scope 'gist'"
                  ))
                ) {
                  GM_setValue("oauth", id);
                } else {
                  throw "OAUTH is required.";
                }
              }

              return id;
            },
          })
            .getGist(this.gistId)
            .update(
              {
                description: obj.title,
                files: files,
              },
              function (err, res) {
                if (!err) {
                  GM_deleteValue(_idKey);
                }
                console.log(err, res, arguments);
                cb({
                  error: err,
                  body: res,
                });
              }
            );
        };

        this.save = function (data) {
          _data = JSON.parse(GM_getValue("premium-data", "{}"));

          if (data.error) {
            this.update({
              color: _const.ERROR,
              message: data.message || data.errmsg,
            });
          } else {
            var tnext = (_data[this.id] || {}).next,
              logger = _activities.gistLogger,
              addLog = true;
            try {
              _data[this.id] = obj.data ? obj.data.apply(this, [data]) : data;
              addLog = data.log === undefined || data.log;

              this.update({
                color: _const.SUCCESS,
                message: _data[this.id].message,
              });
            } catch (e) {
              // TODO TRY-CATCH block should be removed in production mode
              console.error(e);
              _data[this.id] = {
                error: 1,
                message: e.toString(),
              };
            }
            if (addLog) {
              if (cfg && _const.ATTACHED == cfg.log) {
                logger &&
                  logger.log(this.id + " " + JSON.stringify(_data[this.id]));
              } else if (cfg && _const.DETACHED == cfg.log) {
                this.log(_data[this.id]);
                this.store(function () {});
              }
            }
            _data[this.id].time = nst(this.bar.page.time);
            _data[this.id].next = data.next ? nst(data.next) : tnext;

            obj.update && obj.update.apply(this, [_data[this.id]]);

            console.log(this.id, _data[this.id]);
            var key = this.id + "-handler";
            if (this.bar.update(key, _data[this.id])) {
              window.localStorage.setItem(key, JSON.stringify(_data[this.id]));
            }
          }

          GM_setValue("premium-data", JSON.stringify(_data));
        };

        this.update = function (o) {
          if (_data[this.id]) {
            _data[this.id].color = o.color;
            _data[this.id].message = o.message || "";
          } else {
            _data[this.id] = o;
          }
          console.log(_data[this.id].message);

          var button = xpath("id('" + this.id + "')")[0];

          if (button) {
            var c = colors[_data[this.id].color],
              v = [
                _data[this.id].time || "-",
                _data[this.id].next || "-",
                _data[this.id].message,
              ];

            button.setAttribute(
              "title",
              "Last	: $0\nNext	: $1\n\n$2".replace(/\$(\d+)/g, function ($0, $1) {
                return v[$1];
              })
            );
            button.style.outlineColor = c;
            button.setAttribute("data-color", c);
          }
        };

        this.get = function () {
          return _data[this.id];
        };

        this.set = function (key, value) {
          _data[this.id][key] = value;
        };

        this.prompt = function (k, q, d) {
          var _page = this.bar.page,
            key = this.id + k,
            data = _page.getUserData(key);
          if (
            !data &&
            (data = prompt(
              (q || k) +
                "\n\nNote: This value isn't modifiable, so be careful.",
              d || ""
            ))
          ) {
            _page.setUserData(key, data);
          }
          return data || "";
        };

        if (obj.first) {
          obj.first.apply(this, [cfg]);
        }

        for (var ai = 0, at = obj.tasks.length; ai < at; ++ai) {
          var t = obj.tasks[ai];

          if (
            (cfg && (_const.AUTO == cfg.auto || _const.SHOW == cfg.display)) ||
            (!cfg &&
              (_const.AUTO == obj.values[_const.EXECUTE] ||
                _const.SHOW == obj.values[_const.DISPLAY]))
          ) {
            _tasks.push(
              myCron.addTask({
                id: this.id + ai,
                interval: t[0],
                relative: t[1],
                delay: obj.delay,
                priority: obj.priority,
                command: function (auto) {
                  _data = JSON.parse(GM_getValue("premium-data", "{}"));

                  var output = false;
                  if (
                    !auto ||
                    (cfg && _const.AUTO == cfg.auto) ||
                    (!cfg && _const.AUTO == obj.values[_const.EXECUTE])
                  ) {
                    output = _execute.apply(_activity, arguments);
                  } else {
                    _activity.update({
                      color: _const.READY,
                      message: "Ready to run.",
                    });

                    output = true;
                  }

                  if (output) {
                    GM_setValue("premium-data", JSON.stringify(_data));
                  }

                  return output;
                },
              })
            );
          }
        }
      },
      updateStocks = function (data) {
        return Template.get(GM_getResourceText("toolbarStocks"), data);
      },
      updateBalance = function (data) {
        return {
          value: myPage.format(data.value || 0),
          collected: data.collected
            ? {
                title: "Interest collected today!",
                class: "collected",
              }
            : {
                title: "Interest not yet collected.",
                class: "",
              },
        };
      },
      updateTotal = function (data) {
        return myPage.format(
          parseInt(data.bank.replace(/\D+/g, ""), 10) +
            parseInt(data.till.replace(/\D+/g, ""), 10) +
            myPage.np
        );
      },
      storageKeys = [
        "featuredGame-handler",
        "stockMarket-handler",
        "bankInterest-handler",
        "shopTill-handler",
      ];

    this.get = function (key, defaultValue) {
      var v = _data[key];
      return v === undefined ? defaultValue : v;
    };

    Object.defineProperties(this, {
      page: {
        value: myPage,
      },
      cron: {
        value: myCron,
      },
    });

    this.update = function (key, data) {
      var bankOrTill = undefined,
        executed = false;

      switch (key) {
        case "featuredGame-handler":
          var name = xpath("id('pfg-name')")[0];

          xpath("id('fgmenu')//ul//div/a").forEach(function (link) {
            link.setAttribute(
              "href",
              "https://www.neopets.com/games/game.phtml?game_id=" + data.game.id
            );
            link.setAttribute("title", data.game.name);
          });

          name.textContent = data.game.name;
          name.previousElementSibling.setAttribute(
            "src",
            "https://images.neopets.com/games/pages/icons/pfg/p-" +
              data.game.id +
              ".png"
          );
          name.previousElementSibling.setAttribute("alt", data.game.name);
          return true;
        case "stockMarket-handler":
          var stocks = xpath("id('stock_div')//table")[0];
          if (stocks) {
            stocks.outerHTML = updateStocks(data);
          }
          return true;
        case "bankInterest-handler":
          var content = xpath(".//div[@class = 'bank-content']")[0],
            data2 = updateBalance(data);

          bankOrTill = {
            bank: data2.value,
            till: myPage.format(this.get("shopTill", {}).value || 0),
          };

          content.previousElementSibling.setAttribute(
            "title",
            data2.collected.title
          );
          content.previousElementSibling.setAttribute(
            "class",
            "bank-interest " + data2.collected.class
          );
          content.replaceChild(
            document.createTextNode(bankOrTill.bank + " NP"),
            content.lastChild
          );
          executed = true;
          break;
        case "shopTill-handler":
          var content = xpath(".//div[@class = 'shop-content']")[0]; // content is undefined

          bankOrTill = {
            bank: myPage.format(this.get("bankInterest", {}).value || 0),
            till: myPage.format(data.value),
          };

          if (content) {
            content.replaceChild(
              document.createTextNode(bankOrTill.till + " NP"),
              content.lastChild
            );
          }
          executed = true;
          break;
      }

      if (bankOrTill) {
        var content = xpath(".//div[@class = 'wallet-content']")[0];
        if (content) {
          content.replaceChild(
            document.createTextNode(updateTotal(bankOrTill) + " NP"),
            content.lastChild
          );
        }
      }

      return executed;
    };

    this.search = function (obj) {
      if (!obj.items.length) {
        throw "BUY : 'items' is required";
      } else if (0 > obj.tries) {
        throw "'tries' must be greater than 0";
      }
      if (!obj.tries) {
        obj.tries = 10;
      }
      var _this = this,
        wizard = new Wizard(this.page),
        items = [];

      obj.items.sort(function (a, b) {
        return (
          -(a[1] > b[1]) ||
          +(a[1] != b[1]) || // quantity DESC
          -(a[0] < b[0]) ||
          +(a[0] != b[0])
        ); // name ASC
      });

      (function recursive1(tries, index) {
        if (tries) {
          _this.update({
            color: _const.WAITING,
            message: "Searching " + obj.items[index][0] + "... (" + tries + ")",
          });
          wizard.search({
            text: obj.items[index][0],
            callback: function (o) {
              console.log("WIZARD", o);
              if (o.items.length) {
                if (index in items) {
                  for (var ai = items[index].length; 0 <= --ai; ) {
                    if (o.item.group == items[index][ai].group) {
                      console.log(
                        "Removed previous result from group " + o.item.group
                      );
                      items[index].splice(ai, 1);
                    }
                  }
                  Array.prototype.push.apply(items[index], o.items);
                } else {
                  items[index] = o.items;
                }
              }

              if (++index < obj.items.length) {
                recursive1(tries, index);
              } else {
                if (!--tries) {
                  for (var ai = 0, at = items.length; ai < at; ++ai) {
                    if (!items[ai].length) {
                      o.error = 1;
                      o.errmsg = obj.items[ai][0] + " not found.";
                      obj.callback(o);
                      return;
                    }
                  }
                }
                recursive1(tries, 0);
              }
            },
          });
        } else {
          var cost = 0;

          for (var ai = 0, at = items.length; ai < at; ++ai) {
            items[ai].sort(function (a, b) {
              return (
                -(a.price < b.price) ||
                +(a.price != b.price) ||
                -(a.stock > b.stock) ||
                +(a.stock != b.stock) ||
                -(a.index > b.index) ||
                +(a.index != b.index) ||
                -(a.owner > b.owner) ||
                +(a.owner != b.owner)
              );
            });

            // multiplica pela quantidade a ser comprada
            if (items[ai].length) {
              var item = items[ai][Math.min(3, items[ai].length) - 1];
              cost += obj.items[ai][1] * items[ai][0].price;

              console.log("Updating price...", item);
              _this.page.database.insertOrUpdate(
                "items",
                {
                  id: item.id,
                },
                item
              );
            }
          }
          _this.page.database.commit();

          obj.callback({
            cost: cost,
            items: items,
          });
        }
      })(obj.tries, 0);
    };

    this.buy = function (obj) {
      var cb = obj.callback,
        _this = this;
      obj.callback = function (oo) {
        obj.callback = cb;
        var items = oo.items,
          cost = oo.cost;

        if (items && cost) {
          var iremoved = [],
            getListItems = function () {
              return iremoved.concat(
                obj.items.map(function (item) {
                  return {
                    name: item[0],
                    bought: true,
                  };
                })
              );
            };

          console.log("CHECK", cost, obj.limit);
          if (cost > obj.limit) {
            obj.callback({
              error: 1,
              errmsg: "NP limit exceeded [" + cost + " > " + obj.limit + "]",
              items: getListItems(),
            });
          } else {
            var shop = new Shop(_this.page),
              total = 0,
              recursive3 = function (nBuys, index, again) {
                _this.update({
                  color: _const.WAITING,
                  message:
                    "Buying " +
                    obj.items[index][0] +
                    "... (" +
                    nBuys +
                    ") " +
                    again,
                });
                console.log(index, items[index]);
                shop.buy({
                  url: items[index][0].link,
                  callback: function (o) {
                    if (
                      o.error ||
                      !o.items.length ||
                      o.items[0].name != items[index][0].name
                    ) {
                      items[index].shift();
                    }
                    if (!o.error) {
                      total += items[index][0].price;
                    }

                    o.total = total;
                    o.items = getListItems();
                    if (o.error && (!again || /neopoint/i.test(o.errmsg))) {
                      // You do not have enough Neopoints to purchase this item!
                      obj.callback(o);
                    } else if (
                      o.error ||
                      (++index < obj.items.length &&
                        nBuys < obj.items[index][1])
                    ) {
                      // existe próximo item
                      console.log("Buying next item");
                      recursive3(nBuys, index, !o.error); // comprar
                    } else if (++nBuys < obj.items[0][1]) {
                      // ainda falta comprar itens
                      console.log("Buying first item");
                      recursive3(nBuys, 0, true);
                    } else {
                      obj.callback(o);
                    }
                  },
                });
              },
              next1 = function () {
                cost *= 1.25;
                if (cost > _this.page.np) {
                  new Bank(_this.page).withdraw({
                    value: Math.ceil(cost),
                    callback: function (o) {
                      if (o.error) {
                        o.items = getListItems();
                        obj.callback(o);
                      } else {
                        recursive3(0, 0, true);
                      }
                    },
                  });
                } else {
                  recursive3(0, 0, true);
                }
              };

            if (obj.sdb) {
              new SDB(_this.page).remove({
                items: obj.items,
                callback: function (o) {
                  if (1 == obj.sdb && o.removed.length) {
                    var sortingNeeded = false;
                    for (var ai = obj.items.length; 0 <= --ai; ) {
                      for (var bi = 0, bt = o.removed.length; bi < bt; ++bi) {
                        var removed = o.removed[bi];

                        if (removed.name == obj.items[ai][0]) {
                          if (removed.quantity >= obj.items[ai][1]) {
                            console.log("Skipping from buying...", removed);
                            iremoved.push({
                              name: removed.name,
                              bought: false,
                            });
                            obj.items.splice(ai, 1);
                            items.splice(ai, 1);
                          } else if (!obj.keep) {
                            obj.items[ai][1] -= removed.quantity;
                            sortingNeeded = true;
                          }

                          break;
                        }
                      }
                    }

                    if (sortingNeeded) {
                      obj.items
                        .map(function (v, i) {
                          return {
                            comp: v[1],
                            value1: v,
                            value2: items[i],
                          };
                        })
                        .sort(function (a, b) {
                          return -(a.comp > b.comp) || +(a.comp != b.comp); // quantity DESC
                        })
                        .forEach(function (v, i) {
                          obj.items[i] = v.value1;
                          items[i] = v.value2;
                        });
                    }
                  }

                  if (obj.items.length) {
                    next1();
                  } else {
                    o.total = 0;
                    o.items = iremoved;
                    obj.callback(o);
                  }
                },
              });
            } else {
              next1();
            }
          }
        } else {
          oo.total = 0;
          obj.callback(oo);
        }
      };

      _this.search(obj);
    };

    var actCfg = myWin.get("actions") || {};
    //myCron.reset();
    for (var ai = 0, at = activities.length; ai < at; ++ai) {
      var act = activities[ai],
        d = _data[act.id] || {};

      if (
        act.custom &&
        (actCfg[act.id] ? actCfg[act.id].display : act.values[_const.DISPLAY])
      ) {
        act.class = "custom" + (1 + (customCounter++ % 5));
      }

      act.result = {
        time: d.time || "-",
        next: d.next || "-",
        color: colors[d.color || _const.DEFAULT] || d.color,
        message: ("" + d.message).replace(/"/g, "&quot;"),
      };

      _activities[act.id] = new Activity(act);
    }

    if (myPage.premium) {
      console.warn("Current user already is premium.");
    } else {
      var orders = JSON.parse(localStorage.getItem("dailies-order") || "[]"),
        customDailies = ""
          .split("\n")
          .filter(function (i) {
            return i && 0 < i.length;
          })
          .map(function (item) {
            // "title:link1", "link2"
            var d = item.split(":"),
              u = d.slice(1).join(":") || d[0];

            return {
              id: d[0].replace(/\W+/g, ""),
              title: d[0],
              desc: "",
              url: u,
              class: "custom" + (1 + (customCounter++ % 5)),
              result: {
                color: colors[_const.DEFAULT],
                time: "Custom link",
                message: u,
              },
            };
          }),
        dailies = activities
          .filter(function (value) {
            return actCfg[value.id]
              ? actCfg[value.id].display
              : value.values[_const.DISPLAY];
          })
          .concat(customDailies)
          .sort(function (a, b) {
            var ai = orders.indexOf(a.id),
              bi = orders.indexOf(b.id);

            return -(ai < bi) || +(ai != bi); // ASC
          }),
        addClickEvent = function (d) {
          // https://stackoverflow.com/a/31080629
          var node = xpath("id('" + d.id + "')/a")[0],
            moved;
          node.addEventListener(
            "click",
            function (e) {
              e.preventDefault();
            },
            false
          );
          node.addEventListener(
            "mousedown",
            function (e) {
              if (1 == e.which) {
                moved = [e.pageX, e.pageY];
              }
            },
            false
          );
          node.addEventListener(
            "mouseup",
            function (e) {
              if (1 == e.which && moved[0] == e.pageX && moved[1] == e.pageY) {
                e.preventDefault();
                _activities[d.id].execute(function () {}, e);
              }
            },
            false
          );
        };

      main.insertAdjacentHTML(
        "afterend",
        GM_getResourceText("toolbarCss") +
          Template.get(GM_getResourceText("toolbarHtml"), {
            activities: activities.concat(customDailies),
            dailies: dailies,
            featuredGame: this.get("featuredGame", {}).game || {
              id: 1042,
              name: "Mutant Graveyard of Doom II",
            },
            bankRoll: {
              balance: updateBalance(this.get("bankInterest", {})),
              till: myPage.format(this.get("shopTill", {}).value || 0),
              stocksTemplate: updateStocks(this.get("stockMarket", {})), // ["1,000", "16,000", "20,000", '<font color="green">+25,6%</font>']
              get total() {
                return updateTotal({
                  bank: this.balance.value,
                  till: this.till,
                });
              },
            },
          })
      );

      xpath("id('settings_anchor')")[0].addEventListener(
        "click",
        function (e) {
          myWin.open();
        },
        false
      );

      for (var ai = 0, at = dailies.length; ai < at; ++ai) {
        addClickEvent(dailies[ai]);
      }

      executeToolbar();
    }

    window.addEventListener(
      "storage",
      function (e) {
        if (
          e.oldValue != e.newValue &&
          /^http:\/\/\w+\.neopets\.com\//.test(e.url)
        ) {
          if (~storageKeys.indexOf(e.key)) {
            _myBar.update(e.key, JSON.parse(e.newValue));
          }
        }
      },
      false
    );

    for (var ai = 0, at = activities.length; ai < at; ++ai) {
      var act = activities[ai];

      if (
        (act.inpage == true && location.href == act.url) ||
        (typeof act.inpage == "function" && act.inpage())
      ) {
        _activities[act.id].save(myPage.getDocument());
      }
    }

    console.log(_data);
  };
