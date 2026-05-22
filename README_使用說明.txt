# GitHub Pages 一鍵上傳 BAT 使用說明

## 你要怎麼放

把 `上傳到GitHub.bat` 放到你的網站資料夾裡。

資料夾大概像這樣：

```
你的GitHub專案資料夾/
├─ index.html
├─ data/
│  ├─ config.json
│  └─ compound_config.json
├─ ITEM.INI
├─ MONSTER_C.INI
├─ MAGIC.INI
├─ STATUS.INI
├─ COMPOUND.INI
├─ CHANGEBODYITEM.INI
├─ 一般怪物位置.csv
└─ 上傳到GitHub.bat
```

## 第一次使用

1. 先到 GitHub 建一個 repository
2. 複製它的 HTTPS 網址，例如：
   `https://github.com/leonmax78/leonmax78.github.io.git`
3. 雙擊 `上傳到GitHub.bat`
4. 第一次它會問你 GitHub 專案網址，貼上去即可

## 之後更新

你只要：

1. 修改網站檔案
2. 雙擊 `上傳到GitHub.bat`
3. 輸入更新說明或直接 Enter
4. 完成

## GitHub Pages 設定

到 GitHub 專案：

Settings → Pages

設定：

- Source：Deploy from a branch
- Branch：main
- Folder：/root

之後網址通常會是：

`https://你的帳號.github.io/專案名稱/`

如果 repository 名稱是：

`你的帳號.github.io`

那網址會是：

`https://你的帳號.github.io/`
