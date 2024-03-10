// ==UserScript==
// @name           Includes : Neopets : Stamp Album
// @namespace      https://gm.wesley.eti.br/neopets
// @description    Stamp Function
// @author         w35l3y
// @email          w35l3y@brasnet.org
// @copyright      2009, w35l3y (https://gm.wesley.eti.br/includes/neopets)
// @license        GNU GPL
// @homepage       https://gm.wesley.eti.br/includes/neopets
// @version        1.0.0.2
// @language       en
// @include        nowhere
// @grant          GM_log
// @grant          GM_addStyle
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_openInTab
// @grant          GM_deleteValue
// @grant          GM_xmlhttpRequest
// @icon           https://gm.wesley.eti.br/icon.php?desc=SCRIPTNAME
// @require        https://github.com/w35l3y/userscripts/raw/master/backup/wontfix/page3/54389.user.js
// @require        https://github.com/w35l3y/userscripts/raw/master/backup/wontfix/page1/54987.user.js
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

Stamp = function () {};

Stamp.convert = function (doc, is_progress, add_reference) {
  var output;
  var title;
  if (is_progress) {
    output = [];

    var albums = doc.evaluate(
      ".//td[@class='content']//table/tbody/tr/td[1]/a",
      doc,
      null,
      XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    for (var ai = albums.snapshotLength; ai--; ) {
      var album = albums.snapshotItem(ai);

      output.push({
        Id: album.href.match(/[?&]page_id=(\d+)/)[1],
        Title: album.textContent,
        Total: album.parentNode /*td*/.parentNode /*tr*/.cells[2].textContent,
      });
    }
  } else if (
    (title = doc.evaluate(
      ".//td[@class='content']//table/tbody/tr[1]/td/b",
      doc,
      null,
      XPathResult.ANY_UNORDERED_NODE_TYPE,
      null
    ).singleNodeValue)
  ) {
    output = {
      Title: title.textContent.replace(/^\s*-\s*|\s*-\s*$/g, ""),
      Stamps: [],
    };

    var stamps = doc.evaluate(
      ".//td[@class='content']//table/tbody/tr/td/img",
      doc,
      null,
      XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    for (var ai = stamps.snapshotLength; ai--; ) {
      var stamp = stamps.snapshotItem(ai);

      var obj = {
        Name: stamp.getAttribute("title") || stamp.getAttribute("alt") || "",
        Image: stamp.getAttribute("src"),
      };
      if (add_reference) obj.Reference = stamp;

      output.Stamps.push(obj);
    }
  }

  return output;
};

Stamp.progress = function (params) {
  if (typeof params.onsuccess != "function") {
    WinConfig.init({
      type: "error",
      title: "Stamp Album",
      description: "<br />Parameter 'onsuccess' is wrong/missing.",
    })
      .Open()
      .FadeIn(0);
  } else {
    HttpRequest.open({
      method: "get",
      url: "https://www.neopets.com/stamps.phtml",
      onsuccess: function (params) {
        var obj = params.parameters || {};
        obj.progress = Stamp.convert(params.response.xml, true);

        params.onsuccess(obj);
      },
      parameters: params,
    }).send({
      type: "progress",
    });
  }
};

Stamp.album = function (params) {
  if (typeof params.onsuccess != "function") {
    WinConfig.init({
      type: "error",
      title: "Stamp Album",
      description: "<br />Parameter 'onsuccess' is wrong/missing.",
    })
      .Open()
      .FadeIn(0);
  } else {
    HttpRequest.open({
      method: "get",
      url: "https://www.neopets.com/stamps.phtml",
      onsuccess: function (params) {
        var obj = params.parameters || {};
        obj.page = Stamp.convert(params.response.xml, false);

        params.onsuccess(obj);
      },
      parameters: params,
    }).send({
      type: "album",
      page_id: params.page || "1",
      owner: params.owner || "",
    });
  }
};

if (location.hash == "#debug" && location.pathname == "/stamps.phtml") {
  var output = [];

  if (/^\?type=progress/.test(location.search)) {
    Stamp.convert(document, true).forEach(function (album) {
      output.push([album.Id, album.Title, album.Total]);
    });
  } else if (/^\?type=album&page_id=/.test(location.search)) {
    var album = Stamp.convert(document, false);
    output.push(album.Title);
    album.Stamps.forEach(function (stamp) {
      output.push([stamp.Name, stamp.Image]);
    });
  }

  alert(output.join("\n"));
}
