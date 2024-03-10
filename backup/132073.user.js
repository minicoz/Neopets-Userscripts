// ==UserScript==
// @name           Includes : AjaxUpdate [BETA]
// @namespace      https://gm.wesley.eti.br
// @description    AjaxUpdate Function
// @author         w35l3y
// @email          w35l3y@brasnet.org
// @copyright      2012+, w35l3y (https://gm.wesley.eti.br)
// @license        GNU GPL
// @homepage       https://gm.wesley.eti.br
// @version        1.0.0.1
// @language       en
// @include        nowhere
// @exclude        *
// @grant          GM_xmlhttpRequest
// @icon           https://gm.wesley.eti.br/icon.php?desc=132073
// @require        https://github.com/w35l3y/userscripts/raw/master/includes/Includes_XPath/63808.user.js
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

AjaxUpdate = function () {};
AjaxUpdate.init = function (obj) {
  var result = {
    error: !!obj.error,
    document: xpath(obj.root)[0],
    next: function (x) {
      var tmp = {
        open: {
          method: "get",
          url: "#",
          headers: {
            Referer: obj.referer || location.href,
          },
          onsuccess: function (xhr) {
            var root = xpath(obj.root, xhr.response.xml)[0];
            if (root) {
              result.document.parentNode.replaceChild(root, result.document);
              obj.referer = xhr.response.raw.finalUrl;
            } else {
              console.log(xhr.response.text);
            }
            obj.error = !root;
            AjaxUpdate.init(obj);
          },
        },
        send: {},
      };

      if (x instanceof HTMLAnchorElement) {
        tmp.open.url = x.href;
      } else if (!obj.result || (x = obj.result(x))) {
        tmp.open.method = x.method || "get";
        tmp.open.url = x.action || "#";
        tmp.send = x.elements || {};
      }

      HttpRequest.open(tmp.open).send(tmp.send);
    },
  };

  if (result.document) {
    if (obj.triggers) {
      xpath(obj.triggers, result.document).forEach(function (trigger) {
        trigger.addEventListener(
          trigger instanceof HTMLFormElement ? "submit" : "click",
          function (e) {
            e.preventDefault();
            e.stopPropagation();

            result.next(this);
          },
          false
        );
      });
    }

    obj.onsuccess(result);
  }
};
