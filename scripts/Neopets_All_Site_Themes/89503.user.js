// ==UserScript==
// @name           Neopets : All Site Themes
// @namespace      https://gm.wesley.eti.br/neopets
// @description    Allows you use any theme to view neopets.com
// @author         w35l3y
// @email          w35l3y@brasnet.org
// @copyright      2013+, w35l3y (https://gm.wesley.eti.br)
// @license        GNU GPL
// @homepage       https://gm.wesley.eti.br
// @version        3.4.1
// @language       en
// @include        https://www.neopets.com/*
// @icon           https://gm.wesley.eti.br/icon.php?desc=89503
// @grant          GM_addStyle
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_xmlhttpRequest
// @grant          GM_getResourceText
// @connect        github.com
// @connect        raw.githubusercontent.com
// @run-at         document-start
// @resource       meta https://github.com/w35l3y/userscripts/raw/master/scripts/Neopets_All_Site_Themes/89503.user.js
// @resource       i18n ../../includes/Includes_I18n/resources/default.json
// @resource       updaterWindowCss ../../includes/Includes_Updater/resources/default.css
// @resource       updaterWindowHtml ../../includes/Includes_Updater/resources/default.html
// @require        ../../includes/Includes_XPath/63808.user.js
// @require        ../../includes/Includes_HttpRequest/56489.user.js
// @require        ../../includes/Includes_Translate/85618.user.js
// @require        ../../includes/Includes_I18n/87940.user.js
// @require        ../../includes/Includes_Updater/87942.user.js
// @history        3.4.0 Added "Destroyed Faerie Festival" Theme
// @history        3.3.0 Added 5 more themes (Grey Day, Kiko Lake, Mystery Island, Roo Island, Tyrannia)
// @history        3.2.0 Added "JumpStart" Theme
// @history        3.1.0 Added 4 more themes (Battleground: Seekers, Daily Dare: Chadley, Monster Hunting and Habitarium)
// @history        3.0.0 Fixed some bugs
// @history        2.3.0 Added "Battleground: Awakened" Theme
// @history        2.3.0 Added "Battleground: Brute Squad" Theme
// @history        2.3.0 Added "Battleground: Order of the Red Erisim" Theme
// @history        2.3.0 Added "Battleground: Thieves Guild" Theme
// @history        2.2.0 Added Includes Checker (due to the recent problems with userscripts.org)
// @history        2.1.0 Added "Battleground: The Sway" Theme
// @history        2.1.0 Added "Tyrannia: Mysterious Obelisk" Theme
// @history        2.0.0.0 Updated @require#87942
// @history        1.0.4.1 updated i18n
// @history        1.0.4.0 added "Treasure Keepers" theme
// @history        1.0.3.0 added "Krawk Island" theme
// @history        1.0.2.0 added "Festival of Neggs" theme
// @history        bug from fx 3.x to 4.x
// @history        1.0.1.0 added "The Faeries' Ruin" theme
// @history        1.0.0.1 made code a little cleaner
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

(function () {
  // script scope
  // missing themes: 1, 2, 44
  var themes = {
      // value : [css, name, random_images]
      10: ["010_acp_6ffcb", "Altador Cup", 16],
      11: ["011_alc_c1d1c", "Altadorian Constellations", 12],
      24: ["024_aota_3db1f", "Atlas of the Ancients", 10],
      29: ["029_awk_15364", "Battleground: Awakened", 6],
      30: ["030_brt_19821", "Battleground: Brute Squad", 6],
      32: ["032_ord_635af", "Battleground: Order of the Red Erisim", 6],
      34: ["034_tvg_yg724", "Battleground: Thieves Guild", 6],
      33: ["033_swy_82090", "Battleground: The Sway", 6],
      31: ["031_skr_8944c", "Battleground: Seekers", 6],
      8: ["008_com_e529a", "Curse of Maraqua", 10],
      12: ["012_tcg_d977a", "Cyodrake's Gaze", 8],
      23: ["023_dyd_c470b", "Daily Dare", 10],
      36: ["036_ddc_je4z0", "Daily Dare: Chadley", 2],
      46: ["046_ff_sep2017", "Destroyed Faerie Festival", 4],
      26: ["026_fon_f2c70", "Festival of Neggs", 7],
      39: ["039_gry_2j9b4", "Grey Day", 5],
      38: ["038_hab_ig53k", "Habitarium", 12],
      4: ["004_bir_a2e60", "Happy Birthday", 7],
      3: ["003_hws_9bde9", "Haunted Woods", 11],
      45: ["045_jmp_af2015", "JumpStart", 1],
      40: ["040_klk_z0j87", "Kiko Lake", 4],
      28: ["028_kri_306cb", "Krawk Island", 7],
      37: ["037_hmh_f7k8s", "Monster Hunting", 14],
      41: ["041_myi_d3u7l", "Mystery Island", 7],
      0: ["000_def_f65b1", "Neopets Basic", 15],
      16: ["016_blu_e56fc", "Neopets Blue", 15],
      17: ["017_grn_f0c1a", "Neopets Green", 15],
      18: ["018_prpl_f65b1", "Neopets Purple", 9],
      15: ["015_red_062bf", "Neopets Red", 15],
      14: ["014_yel_d187b", "Neopets Yellow", 15],
      20: ["020_ppl_3c22d", "Petpet Protection League", 15],
      21: ["021_cpa_5ce03", "Puzzle Adventure", 19],
      9: ["009_qas_93707", "Qasalan", 9],
      22: ["022_lqc_d2d1a", "Quizara's Curse", 9],
      42: ["042_roo_2s6am", "Roo Island", 8],
      7: ["007_sfp_273a8", "Space Faerie Premium", 4],
      13: ["013_tow_4b54b", "Tale of Woe", 10],
      25: ["025_tfr_5ce03", "The Faeries' Ruin", 8],
      19: ["019_sloth1_7f914", "The Return of Dr. Sloth", 13],
      27: ["027_tkg_69097", "Treasure Keepers", 11],
      43: ["043_tyr_e4uc5", "Tyrannia", 7],
      35: ["035_tmo_we6g3", "Tyrannia: Mysterious Obelisk", 14],
      6: ["006_val_d85a0", "Valentine's Day", 9],
      5: ["005_win_57061", "Winter Holiday", 11],
    },
    in_list = [];

  function changeTheme(css_link, themeId) {
    var theme = themes[themeId],
      thm_images = xpath(
        ".//img[contains(@src, '/themes/') and not(contains(@src, '/rotations/'))]"
      ),
      rnd_image = xpath(
        "id('footer')/img[contains(@src, '/themes/') and contains(@src, '/rotations/')]"
      )[0];

    css_link.href = css_link.href.replace(/\w+\.css/, theme[0] + ".css");
    rnd_image.src = rnd_image.src.replace(
      /\w+\/rotations\/\d+/,
      theme[0] + "/rotations/" + Math.floor(1 + (theme[2] || 4) * Math.random())
    );

    thm_images.forEach(function (img) {
      img.src = img.src.replace(/themes\/\w+/, "themes/" + theme[0]);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var css_link = xpath(".//head/link[contains(@href, '/css/themes/')]")[0],
      username = xpath(
        "string(id('header')//a[contains(@href, '/userlookup.phtml?user=')]/text())"
      );

    if (css_link && username) {
      var def_theme = (/\/((\d+)\w+)\.css/.test(css_link.href) && [
          "" + parseInt(RegExp.$2, 10),
          RegExp.$1,
        ]) || ["0", "000_def_f65b1"],
        selectedTheme = GM_getValue(username + "-css", def_theme[0]);

      if (!(selectedTheme in themes)) {
        selectedTheme = def_theme[0];
      } else if (!(def_theme[0] in themes)) {
        console.log("NEW THEME", def_theme);
      } else if (def_theme[0] != selectedTheme) {
        changeTheme(css_link, selectedTheme);
      }

      if (location.pathname == "/preferences.phtml") {
        var user_theme = xpath(
            "id('content')//form//select[@name='user_theme']"
          )[0],
          selected = user_theme.options[user_theme.selectedIndex].value || "0";

        for (var ai = 0, at = user_theme.options.length; ai < at; ++ai) {
          // remove themes that are already in list
          let opt = user_theme.options[ai],
            bi = opt.value;

          opt.setAttribute("data-value", bi);

          if (bi in themes) {
            in_list.push(bi);
          } else {
            console.log("NEW THEME", bi, opt.label);
          }
        }

        for (var tId in themes) {
          // add the new ones at the end of the list
          var t = themes[tId];

          if (!~in_list.indexOf(tId)) {
            let opt = new Option(t[1], selected);

            opt.style.backgroundColor = "#FFDFDF";
            opt.setAttribute("data-value", tId);

            if (selectedTheme == tId) {
              opt.selected = true;
            }

            user_theme.appendChild(opt);
          }
        }

        user_theme.addEventListener(
          "change",
          function (e) {
            // automatically changes the theme
            var themeId =
              e.target.options[e.target.selectedIndex].getAttribute(
                "data-value"
              );

            if (themeId in themes) {
              changeTheme(css_link, themeId);
            } else {
              GM_deleteValue(username + "-css");
              e.target.form.submit();
            }
          },
          false
        );

        // stores the selected theme
        xpath(
          ".//td[@class = 'content']/div/form//input[@type = 'submit']"
        )[0].form.addEventListener(
          "submit",
          function (e) {
            var themeId =
              user_theme.options[user_theme.selectedIndex].getAttribute(
                "data-value"
              );

            if (themeId in themes) {
              GM_setValue(username + "-css", themeId);
            } else {
              GM_deleteValue(username + "-css");
            }
          },
          false
        );
      }
    }
  });
})();
