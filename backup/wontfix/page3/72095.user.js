// ==UserScript==
// @name           Atlantida : AutoLogin
// @namespace      https://gm.wesley.eti.br
// @author         w35l3y
// @email          w35l3y@brasnet.org
// @copyright      2010+, w35l3y (https://gm.wesley.eti.br)
// @license        GNU GPL
// @homepage       https://gm.wesley.eti.br
// @version        1.0.0.4
// @language       pt-BR
// @request        https://userscripts-mirror.org/topics/48665
// @include        https://192.168.135.1:21680/iha/abertura/atlantica/
// @grant          GM_log
// @icon           https://gm.wesley.eti.br/icon.php?desc=72095
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

location.href =
  "https://192.168.135.1:21680/iha/login/login.php?opc=1&idioma=br&idafiliado=1&conexao_tipo=d&conexao_qtde=1&senha=1009&usuario=Faria";

/*
(function recursive(reqs)
{
	if (reqs.length)
	{
		GM_xmlhttpRequest({
			"url" : reqs.shift(),
			"method" : "get",
			"onload" : function(xhr)
			{
				recursive(reqs);
			}
		});
	}
	else
	{
		alert("Logado!");
	}
})([
//	"https://192.168.135.1:21680/iha/abertura/atlantica/",
	"https://192.168.135.1:21680/iha/abertura/atlantica/aceite.php?dl=br",
	"https://192.168.135.1:21680/iha/abertura/atlantica/login.php?opc=0&dl=br&checkbox=checkbox",
	"https://192.168.135.1:21680/iha/login/login.php?opc=1&idioma=br&idafiliado=1&conexao_tipo=d&conexao_qtde=1&senha=1009&usuario=Faria"
]);
*/
