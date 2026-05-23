// V218 script manifest: 統一管理載入順序。
// index.html 不放功能程式；要新增/停用模組請改這裡。
// 分層：data → core → pages → domain patches → enhancements。
// 注意：patch 仍維持原本載入順序，只是依照功能分類放到資料夾，避免一次搬太大造成壞功能。
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
  "patches_equipment": [
    "js/legacy/patches/equipment/patch-02-equipment-display.js",
    "js/legacy/patches/equipment/patch-03-equipment-special-filter.js",
    "js/legacy/patches/equipment/patch-04-equipment-stable-group.js",
    "js/legacy/patches/equipment/patch-05-underboot-stable70.js",
    "js/legacy/patches/equipment/patch-06-equipment-stat-render.js",
    "js/legacy/patches/equipment/patch-07-accessory-filter.js",
    "js/legacy/patches/equipment/patch-08-accessory-menu-guard.js"
  ],
  "patches_soul": [
    "js/legacy/patches/soul/patch-09-soul-data-page.js"
  ],
  "patches_auth": [
    "js/legacy/patches/auth/patch-10-license-submit.js",
    "js/legacy/patches/auth/patch-11-license-countdown.js"
  ],
  "patches_monster_item_safety": [
    "js/legacy/patches/monster/patch-12-monster-detail-fix.js",
    "js/legacy/patches/safety/patch-13-button-anchor-guard.js",
    "js/legacy/patches/item/patch-14-item-detail-order.js"
  ],
  "patches_jiangshen": [
    "js/legacy/patches/jiangshen/patch-15-star-aura-tabs.js",
    "js/legacy/patches/jiangshen/patch-16-star-exp-training.js",
    "js/legacy/patches/jiangshen/patch-17-star-aura-page.js",
    "js/legacy/patches/equipment/patch-18-equipment-sort-and-jiangshen-fix.js",
    "js/legacy/patches/jiangshen/patch-19-support-integer-compare.js",
    "js/legacy/patches/jiangshen/patch-20-support-slots-compare.js"
  ],
  "enhancements": [
    "js/pages/latest-list.js",
    "js/pages/item-search.js",
    "js/pages/reverse-search-dedupe.js",
    "js/pages/soul-quick-force-fix.js"
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
  ...window.SZO_SCRIPT_GROUPS.patches_equipment,
  ...window.SZO_SCRIPT_GROUPS.patches_soul,
  ...window.SZO_SCRIPT_GROUPS.patches_auth,
  ...window.SZO_SCRIPT_GROUPS.patches_monster_item_safety,
  ...window.SZO_SCRIPT_GROUPS.patches_jiangshen,
  ...window.SZO_SCRIPT_GROUPS.enhancements
];
