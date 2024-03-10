// ==UserScript==
// @name           Neopets : SSW Test
// @namespace      https://gm.wesley.eti.br
// @include        https://www.neopets.com/inventory.phtml
// @version        1.0.0
// @grant          GM_xmlhttpRequest
// @icon           https://gm.wesley.eti.br/icon.php?desc=36215
// @require        https://github.com/w35l3y/userscripts/raw/master/includes/Includes_HttpRequest/56489.user.js
// ==/UserScript==

var params = {
  text: "main codestone",
};

HttpRequest.open({
  method: "post",
  url: "https://www.neopets.com/shops/ssw/ssw_query.php",
  headers: {
    Referer: "https://www.neopets.com/market.phtml?type=wizard",
  },
  onsuccess: function (params) {
    /*var res = {};
		try {
			res = JSON.parse(params.response.text);
		} catch (e) { }*/

    document.head.parentNode.removeChild(document.head);
    document.body.innerHTML =
      "<b>Copy the following text and send it to w35l3y:</b><br />" +
      params.response.text;
  },
}).send({
  q: params.text,
  priceOnly: "0",
  context: "0", // 0=shop 1=gallery
  partial: typeof params.is_exact == "undefined" || params.is_exact ? "0" : "1",
  min_price:
    parseInt(("" + params.min_price).replace(/[,.]+/g, "").substr(0, 5), 10) ||
    0,
  max_price:
    parseInt(("" + params.max_price).replace(/[,.]+/g, "").substr(0, 5), 10) ||
    99999,
  json: "1",
});
