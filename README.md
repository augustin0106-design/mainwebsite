# 駿佾老師的Gogoland

互動教學模擬入口網站，部署到 GitHub Pages：

https://augustin0106-design.github.io/mainwebsite/

## 資料夾

- `index.html`：公開入口網站
- `data/simulations.json`：分類與模擬程式清單
- `data/simulations.js`：公開入口網站載入用資料，避免直接開檔案時 `fetch` 失敗
- `index.html`：也內嵌一份清單資料，讓入口網站即使直接開檔案也能載入
- `simulations/`：單檔 HTML 模擬程式
- `admin/`：本地後台工具，不會被部署到 GitHub Pages
- `tools/`：Codex 或本機可用的上架工具

## 新增模擬

本地後台：

1. 開啟 `admin/index.html`
2. 輸入預設密碼 `gogoland-admin`
3. 選擇本 repo 資料夾
4. 選擇分類、上傳 HTML，送出後會更新 `simulations/` 與 `data/simulations.json`
5. 後台也會同步更新 `data/simulations.js` 與 `index.html` 內嵌資料

Codex 或終端機：

```bash
npm run register -- --file path/to/new.html --category science --title "新模擬" --description "一句話簡介" --tags "關鍵字1,關鍵字2"
```

## GitHub Pages

請在 repo 的 Pages 設定中選擇 GitHub Actions。`deploy-pages.yml` 只會部署公開檔案，不會部署 `admin/`。
