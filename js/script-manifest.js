// V214 script manifest: 統一管理載入順序。
// index.html 不放功能程式；要新增/停用模組請改這裡。
// 分層：data → core → pages → legacy patches → enhancements。
window.SZO_SCRIPT_GROUPS = {
  "data": [
    "js/data/equip-compound-data.js",
    "js/data/jiangshen-data.js",
    "js/data/training-data.js"
  ],
  "core": [
    "js/core/app-core.js",
    "js/core/config-loader.js"
  ],
  "pages": [
    "js/pages/monster-page.js",
    "js/pages/item-page.js",
    "js/pages/reverse-page.js",
    "js/pages/compound-page.js",
    "js/pages/soul-page.js"
  ],
  "legacy_patches": [
    "js/legacy/patches/patch-02.js",
    "js/legacy/patches/patch-03.js",
    "js/legacy/patches/patch-04.js",
    "js/legacy/patches/patch-05.js",
    "js/legacy/patches/patch-06.js",
    "js/legacy/patches/patch-07.js",
    "js/legacy/patches/patch-08.js",
    "js/legacy/patches/patch-09.js",
    "js/legacy/patches/patch-10.js",
    "js/legacy/patches/patch-11.js",
    "js/legacy/patches/patch-12.js",
    "js/legacy/patches/patch-13.js",
    "js/legacy/patches/patch-14.js",
    "js/legacy/patches/patch-15.js",
    "js/legacy/patches/patch-16.js",
    "js/legacy/patches/patch-17.js",
    "js/legacy/patches/patch-18.js",
    "js/legacy/patches/patch-19.js",
    "js/legacy/patches/patch-20.js"
  ],
  "enhancements": [
    "js/pages/latest-list.js",
    "js/pages/item-search.js",
    "js/pages/reverse-search-dedupe.js"
  ],
  "not_loaded_legacy": [
    "js/legacy/not-loaded/app-esmodule-unused.js",
    "js/legacy/not-loaded/jiangshen-duplicate-unused.js",
    "js/legacy/not-loaded/js-modules/",
    "js/legacy/not-loaded/html-modules/"
  ]
};
window.SZO_SCRIPT_MANIFEST = [
  ...window.SZO_SCRIPT_GROUPS.data,
  ...window.SZO_SCRIPT_GROUPS.core,
  ...window.SZO_SCRIPT_GROUPS.pages,
  ...window.SZO_SCRIPT_GROUPS.legacy_patches,
  ...window.SZO_SCRIPT_GROUPS.enhancements
];
