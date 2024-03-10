// ==UserScript==
// @name           SunnyNeo : Lablog! : Record Zap & Import Zaps
// @namespace      https://gm.wesley.eti.br/sunnyneo/lablog
// @description    Lets you easily add your secret laboratory zaps to lablog
// @author         w35l3y
// @email          w35l3y@brasnet.org
// @copyright      2010+, w35l3y (https://gm.wesley.eti.br)
// @license        GNU GPL
// @homepage       https://gm.wesley.eti.br
// @version        1.0.0.7
// @language       en
// @include        https://www.neopets.com/lab2.phtml*
// @include        https://www.neopets.com/process_lab2.phtml*
// @include        https://lablog.sunnyneo.com/import.php*
// @grant          GM_log
// @grant          GM_addStyle
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_openInTab
// @grant          GM_deleteValue
// @grant          GM_xmlhttpRequest
// @icon           https://gm.wesley.eti.br/icon.php?desc=72851
// @require        https://github.com/w35l3y/userscripts/raw/master/includes/Includes_XPath/63808.user.js
// @require        https://github.com/w35l3y/userscripts/raw/master/includes/Includes_Neopets/63810.user.js
// @require        https://github.com/w35l3y/userscripts/raw/master/includes/Includes_HttpRequest/56489.user.js
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

if (location.pathname == "/lab2.phtml") {
  xpath(".//form[contains(@action, 'process_lab2.phtml')]")[0].addEventListener(
    "submit",
    function (e) {
      var lang = xpath(
        "string(id('footer')//select[@name='lang']/option[@selected]/@value)"
      );
      GM_setValue("lang", lang);

      if (
        lang != "en" &&
        (GM_getValue("auto_change_lang", true) ||
          confirm(
            "[SunnyNeo : Lablog! : Record Zap]\nChange language to English?"
          ))
      ) {
        HttpRequest.open({
          url: "https://www.neopets.com/index.phtml",
          method: "post",
          onsuccess: function (params) {
            e.target.submit();
          },
        }).send({ lang: "en" });

        e.preventDefault();
      }
    },
    false
  );
} else if (location.pathname == "/process_lab2.phtml") {
  if (GM_getValue("firstRun", true)) {
    GM_setValue("firstRun", false);
    GM_openInTab("https://lablog.sunnyneo.com/import.php");
  }

  var logs = JSON.parse(GM_getValue("logs", "[]"));

  if (
    /^(?:.+)$/.test((xpath(".//p[1]/b")[0] || { textContent: "" }).textContent)
  ) {
    // .+	-> petname1|petname2|petname3
    var dates = [
        Neopets.convert(document).Time(false),
        (logs.length && new Date(Date.parse(logs[0].date))) || new Date(0),
      ],
      curr = {
        date: dates[0].toString(),
        text: document.body.textContent.replace(/^\s+/gm, ""),
      };
    dates[0].setHours(0, 0, 0, 0);
    dates[1].setHours(0, 0, 0, 0);

    if (
      !logs.length ||
      dates[0] - dates[1] >= 86400000 ||
      curr.text != logs[0].text
    )
      logs.unshift(curr);
  }

  var lang = GM_getValue("lang", "en");
  if (lang != "en")
    HttpRequest.open({
      url: "https://www.neopets.com/index.phtml",
      method: "post",
    }).send({ lang: lang });

  (function recursive(list) {
    GM_setValue("logs", JSON.stringify(list));

    var i = list.length;
    if (i)
      HttpRequest.open({
        method: "post",
        url: "https://lablog.sunnyneo.com/submitzapprocess.php",
        onsuccess: function (params) {
          if (
            /(Your zap was recorded|There is already a zap in the database for this pet|The script could not understand your zap)/.test(
              params.response.text
            )
          ) {
            list.pop();

            recursive(list);

            if (!list.length)
              alert("[SunnyNeo : Lablog! : Record Zap]\n" + RegExp.$1 + "!");
          } else {
            alert(
              "[SunnyNeo : Lablog! : Record Zap]\n" +
                (
                  xpath("id('main')", params.response.xml)[0] || {
                    textContent: "Unknown error has occurred. Try again later",
                  }
                ).textContent
            );

            if (/You need to be logged/.test(params.response.text))
              GM_openInTab("https://lablog.sunnyneo.com/login.php");
          }
        },
      }).send({
        result: list[i - 1].text,
        submit: "Proceed",
        petname: "none",
        c1: "none",
        date: Math.floor(
          (Date.parse(list[i - 1].date) || new Date().valueOf()) / 1000
        ),
      });
  })(logs);
} else if (!/You need to be logged/.test(document.body.textContent)) {
  HttpRequest.open({
    method: "get",
    url: "https://neopets.wesley.eti.br/SecretLaboratory/listEvents.php?type=xml",
    onsuccess: function (params) {
      var pets = {},
        pet_count = 0,
        pet_list = [],
        p = false,
        month = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];

      xpath(".//event/petName/text()", params.response.xml).forEach(function (
        name
      ) {
        var n = name.textContent.toLowerCase();
        if (!(n in pets)) {
          pets[n] = [];
          pet_list.push(n);
          ++pet_count;
        }
        var date =
          new Date(
            Date.parse(
              xpath("string(./ancestor::event[1]/date/text())", name).replace(
                /-/g,
                "/"
              )
            )
          ) || new Date();
        pets[n].unshift(
          [
            ("0" + date.getDate()).substr(-2),
            month[date.getMonth()],
            date.getFullYear(),
            "\t",
            xpath("string(./ancestor::event[1]/text/text())", name),
          ].join(" ")
        );
      });

      if (
        pet_count &&
        (p = (
          "" +
          prompt(
            "Which pet would you like to import now?\n\n[Available pets]\n\n" +
              pet_list.join("\n")
          )
        ).toLowerCase()) in pets
      ) {
        xpath(".//input[@name='petname']")[0].value = p;
        xpath(".//textarea[@name='result']")[0].value = pets[p].join("\n");
      }
    },
  }).send();
}
