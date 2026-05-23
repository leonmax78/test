// V220 script manifest: core settings/maps/utils are split out before app-core.
// index.html remains a pure entry.  Add/disable modules here, not in index.html.
window.SZO_SCRIPT_GROUPS = {
  "data": [
    "js/data/type-maps.js",
    "js/data/equip-compound-data.js",
    "js/data/jiangshen-data.js",
    "js/data/training-data.js",
    "js/data/soul-data.js"
  ],
  "core": [
    "js/core/app-settings.js",
    "js/utils/common-utils.js",
    "js/core/data-loader-utils.js",
    "js/core/app-core.js",
    "js/core/config-loader.js"
  ],
  "pages": [
    "js/pages/monster-page.js",
    "js/pages/item-page.js",
    "js/pages/reverse-page.js",
    "js/pages/compound-page.js",
    "js/pages/soul-page.js",
    "js/pages/soul-data-page.js"
  ],
  "features_equipment": [
    "js/features/equipment/display-and-random-sim.js",
    "js/features/equipment/special-equipment-filter.js",
    "js/features/equipment/stable-group-routing.js",
    "js/features/equipment/underboot-stable70.js",
    "js/features/equipment/stat-renderer.js",
    "js/features/equipment/accessory-filter.js",
    "js/features/equipment/accessory-menu-guard.js"
  ],
  "features_soul": [],
  "features_auth": [
    "js/features/auth/license-submit.js",
    "js/features/auth/license-countdown.js"
  ],
  "features_monster_item_safety": [
    "js/pages/monster-detail-fix.js",
    "js/features/safety/button-anchor-guard.js",
    "js/pages/item-detail-order.js"
  ],
  "features_jiangshen": [
    "js/features/jiangshen/star-aura-tabs.js",
    "js/features/jiangshen/star-exp-training.js",
    "js/features/jiangshen/star-aura-page.js",
    "js/features/compat/equipment-sort-jiangshen-calc-fix.js",
    "js/features/jiangshen/support-integer-compare.js",
    "js/features/jiangshen/support-slots-compare.js"
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
    "js/legacy/not-loaded/archived-patches-v218/",
    "js/legacy/not-loaded/js-modules/",
    "js/legacy/not-loaded/html-modules/"
  ]
};
window.SZO_SCRIPT_MANIFEST = [
  ...window.SZO_SCRIPT_GROUPS.data,
  ...window.SZO_SCRIPT_GROUPS.core,
  ...window.SZO_SCRIPT_GROUPS.pages,
  ...window.SZO_SCRIPT_GROUPS.features_equipment,
  ...window.SZO_SCRIPT_GROUPS.features_auth,
  ...window.SZO_SCRIPT_GROUPS.features_monster_item_safety,
  ...window.SZO_SCRIPT_GROUPS.features_jiangshen,
  ...window.SZO_SCRIPT_GROUPS.enhancements
];
