// ==UserScript==
// @name		   Neopets : Quick SDB Checker
// @namespace	  https://gm.wesley.eti.br/neopets
// @description	Enables Alt+S to quickly check whether the selected text is in SDB and asks to remove it
// @author		 w35l3y
// @email		  w35l3y@brasnet.org
// @copyright	  2013+, w35l3y (https://gm.wesley.eti.br/includes/neopets)
// @license		GNU GPL
// @homepage	   https://gm.wesley.eti.br/includes/neopets
// @version		3.1.1
// @include		https://www.neopets.com/*
// @grant		  GM_log
// @grant		  GM_addStyle
// @grant		  GM_getValue
// @grant		  GM_setValue
// @grant		  GM_deleteValue
// @grant		  GM_xmlhttpRequest
// @grant		  GM_getResourceText
// @icon		   https://gm.wesley.eti.br/icon.php?desc=61435
// @resource	   winConfigCss ../../includes/Includes_WinConfig/resources/default.css
// @resource	   winConfigQuickSDBCheckerCss resources/default.css
// @require		../../includes/Includes_XPath/63808.user.js
// @require		../../includes/Includes_HttpRequest/56489.user.js
// @require		../../includes/Includes_Neopets_Safety_Deposit_Box/56528.user.js
// @require		../../includes/Includes_WinConfig/163374.user.js
// @history		3.1.1 Added missing @icon
// @history		3.1.0 Added Includes Checker (due to the recent problems with userscripts.org)
// @history		3.0.0 Added WinConfig Settings
// @history		2.0.0.0 Updated @require#54987
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

(function (window) {
  "use strict";
  /*jslint indent: 4, maxerr: 50, browser: true, vars: true, nomen: true, plusplus: true, regexp: true, newcap: true */

  GM_addStyle(GM_getResourceText("winConfigQuickSDBCheckerCss"));

  function execute(obj) {
    var sel;

    if ((sel = window.getSelection()).rangeCount) {
      var ai = sel.rangeCount;
      while (ai--) {
        var range = sel.getRangeAt(ai);

        if (range.toString().length) {
          var current = new Date().valueOf(),
            next = parseInt(GM_getValue("nextAccess", "0"), 10),
            time = Math.max(0, next - current),
            params = obj.parameters(range) || [];

          GM_setValue(
            "nextAccess",
            String(obj.time() + (time ? next : current))
          );

          params.unshift(obj.callback, time);

          window.setTimeout.apply(null, params);
        }
      }
    }
  }

  WinConfig.init({
    title: "Quick SDB Checker : Settings",
    type: WinConfig.WindowType.CUSTOM,
    size: ["340px", 0],
    default: {
      executeHotKey: {
        keys: 0x1,
      },
      group: {
        pin: "",
        qnty: 0,
        interval: {
          min: 500,
          rnd: 500,
        },
      },
    },
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
        name: "executeHotKey",
        label: "Search HotKey",
        key: "hotkey",
        callback: function (event, win) {
          var config = win.get("group");

          execute({
            time: function () {
              return (
                config.interval.min +
                Math.ceil(config.interval.rnd * Math.random())
              );
            },
            callback: SDB.list,
            parameters: function (range) {
              return [
                {
                  name: range.toString(),
                  onsuccess: function (params) {
                    var found = false,
                      items = [],
                      dqnty = config.qnty,
                      dpin,
                      executeQnty = function (qnty, item) {
                        var executePin = function (pin) {
                            window.setTimeout(SDB.remove, 1000 * !!dqnty, {
                              pin: pin,
                              name: item.Name,
                              items: [[item.Id, Math.abs(qnty) || 1]],
                              onsuccess: function (params) {
                                if (params.error) {
                                  WinConfig.init({
                                    title: "Quick SDB Checker : Error",
                                    type: WinConfig.WindowType.ERROR,
                                    description:
                                      "<br />" +
                                      ((params.message &&
                                        params.message.textContent.trim()) ||
                                        "Unexpected error"),
                                  });
                                } else {
                                  var ai = 0,
                                    at = params.list.length;
                                  while (ai < at) {
                                    var i = params.list[ai++];
                                    if (i.Name === params.item.Name) {
                                      if (i.Quantity >= params.item.Quantity) {
                                        WinConfig.init({
                                          title: "Quick SDB Checker : Error",
                                          type: WinConfig.WindowType.ERROR,
                                          description:
                                            "<br />You only have " +
                                            i.Quantity +
                                            " of that item.",
                                        });
                                      }

                                      break;
                                    }
                                  }
                                }
                              },
                              parameters: {
                                item: item,
                              },
                            });
                          },
                          tPin = "";

                        if (
                          !xpath("id('pin_field')", params.response.xml) ||
                          (tPin = config.pin || dpin)
                        ) {
                          executePin(tPin);
                        } else {
                          WinConfig.init({
                            title: "Quick SDB Checker : Pin number",
                            type: WinConfig.WindowType.PROMPT,
                            description: "<br />Type in your Pin number:",
                            load: function (result) {
                              if (result.text) {
                                executePin((dpin = result.text));
                              }
                            },
                          });
                        }
                      },
                      ai = 0,
                      at = params.list.length;

                    while (ai < at) {
                      var item = params.list[ai++];

                      items.push(item.Name);

                      if (item.Name === params.range.toString()) {
                        found = true;

                        if (dqnty) {
                          executeQnty(dqnty, item);
                        } else {
                          WinConfig.init({
                            title: "Quick SDB Checker : Quantity",
                            type: WinConfig.WindowType.PROMPT,
                            description:
                              "<br />How many items do you want to remove?<br />(Max = " +
                              item.Quantity +
                              ")",
                            default: {
                              text: 1,
                            },
                            load: function (result) {
                              var qnty = parseInt(result.text, 10);

                              if (qnty) {
                                executeQnty(qnty, item);
                              }
                            },
                          });
                        }

                        break;
                      }
                    }

                    if (!found) {
                      WinConfig.init({
                        title: "Quick SDB Checker : Warning",
                        type: WinConfig.WindowType.WARNING,
                        description:
                          "<br />" +
                          ((params.message &&
                            params.message.textContent.replace(
                              /^\s+|\s+$/g,
                              ""
                            )) ||
                            "<b>List of items found:</b><br />- " +
                              items.join("<br />- ")),
                      });
                    }
                  },
                  parameters: {
                    range: range,
                  },
                },
              ];
            },
          });
        },
      },
      {
        name: "group",
        type: WinConfig.FieldType.GROUP,
        fields: [
          {
            name: "pin",
            label: "Pin number",
            type: WinConfig.FieldType.PASSWORD,
            help: true,
            description:
              "Leave it blank whether you want to be prompted on demand.",
          },
          {
            name: "qnty",
            label: "Quantity",
            format: WinConfig.FieldFormat.NUMBER,
            help: true,
            description:
              "Leave it blank whether you want to be prompted on demand.",
          },
        ],
      },
      {
        name: "group",
        nogroup: true,
        type: WinConfig.FieldType.GROUP,
        fields: [
          {
            name: "interval",
            label: "Interval",
            type: WinConfig.FieldType.GROUP,
            fields: [
              {
                name: "min",
                label: "Minimum",
                format: WinConfig.FieldFormat.NUMBER,
                description:
                  "The minimum value of time between searches.<br /><sup><i>Time in miliseconds</i></sup>",
                empty: 0,
                help: true,
              },
              {
                name: "rnd",
                label: "Random",
                format: WinConfig.FieldFormat.NUMBER,
                description:
                  "The random value of time between searches.<br />This value is multiplied by random value between 0-1 and added to the minimum value.<br /><sup><i>Time in miliseconds</i></sup>",
                empty: 0,
                help: true,
              },
            ],
          },
        ],
      },
    ],
  });
})(this);
