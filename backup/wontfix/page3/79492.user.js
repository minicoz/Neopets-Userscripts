// ==UserScript==
// @name           Examples : DataTables
// @namespace      https://gm.wesley.eti.br/examples
// @description    DataTables - Example of usage
// @author         w35l3y
// @email          w35l3y@brasnet.org
// @copyright      2010+, w35l3y (https://gm.wesley.eti.br)
// @license        GNU GPL
// @homepage       https://gm.wesley.eti.br
// @version        1.0.0
// @language       en
// @grant          GM_addStyle
// @grant          GM_getResourceURL
// @grant          GM_getResourceText
// @icon           https://gm.wesley.eti.br/icon.php?desc=79492
// @include        https://userscripts-mirror.org/users/*/scripts
// @include        https://userscripts-mirror.org/users/*/scripts?*
// @resource       back_disabled https://www.datatables.net/release-datatables/media/images/back_disabled.jpg
// @resource       back_enabled https://www.datatables.net/release-datatables/media/images/back_enabled.jpg
// @resource       forward_disabled https://www.datatables.net/release-datatables/media/images/forward_disabled.jpg
// @resource       forward_enabled https://www.datatables.net/release-datatables/media/images/forward_enabled.jpg
// @resource       sort_asc https://www.datatables.net/release-datatables/media/images/sort_asc.png
// @resource       sort_desc https://www.datatables.net/release-datatables/media/images/sort_desc.png
// @resource       sort_both https://www.datatables.net/release-datatables/media/images/sort_both.png
// @resource       sort_asc_disabled https://www.datatables.net/release-datatables/media/images/sort_asc_disabled.png
// @resource       sort_desc_disabled https://www.datatables.net/release-datatables/media/images/sort_desc_disabled.png
// @resource       demo_table https://www.datatables.net/release-datatables/media/css/demo_table.css
// @require        https://ajax.googleapis.com/ajax/libs/jquery/1.3/jquery.min.js
// @require        https://datatables.net/release-datatables/media/js/jquery.dataTables.js
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

var table = $("#main table:eq(0)");

// removing the old header and adding the new one
$("tr:eq(0)", table).remove();
$("tbody:eq(0)", table).before(
  '<thead><tr><th class="la">Name</th><th class="la">Rating</th><th class="la">Posts</th><th class="la">Fans</th><th class="la">Installs</th><th class="la">Last Updated</th></tr></thead>'
);

// adding style
GM_addStyle(
  GM_getResourceText("demo_table").replace(
    /\.\.\/images\/([\w ]+)\.\w+/g,
    function (m, f) {
      return GM_getResourceURL(f) || m;
    }
  )
);
GM_addStyle("th {color:black}");

// creating table
table.dataTable({
  bPaginate: false,
  bLengthChange: false,
  bFilter: false,
  bSort: true,
  bInfo: false,
  bAutoWidth: false,
});
