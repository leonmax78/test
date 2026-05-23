// V212 script manifest: 所有 JS 載入順序集中在這裡。
// 以後要停用/新增模組，優先改這個檔案，不要改 index.html。
// 注意：js/jiangshen.js 是舊的備份/準備抽離檔，裡面函式 app-core.js 目前已有，所以本版不載入，避免重複宣告。
window.SZO_SCRIPT_GROUPS = {
  "data": [
    "js/data/equip-compound-data.js",
    "js/data/jiangshen-data.js",
    "js/data/training-data.js"
  ],
  "core": [
    "js/app-core.js",
    "js/monster.js",
    "js/item.js",
    "js/reverse.js",
    "js/compound.js",
    "js/soul.js"
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
    "js/config-loader.js",
    "js/latest-list.js",
    "js/item-search.js",
    "js/reverse-search-dedupe.js"
  ],
  "not_loaded_legacy": [
    "js/jiangshen.js"
  ]
};
window.SZO_SCRIPT_MANIFEST = [
  ...window.SZO_SCRIPT_GROUPS.data,
  ...window.SZO_SCRIPT_GROUPS.core,
  ...window.SZO_SCRIPT_GROUPS.legacy_patches,
  ...window.SZO_SCRIPT_GROUPS.enhancements
];
