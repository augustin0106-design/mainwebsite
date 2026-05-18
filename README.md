# 駿佾老師的Gogoland

互動教學模擬入口網站，部署到 GitHub Pages：

https://augustin0106-design.github.io/mainwebsite/

## 資料夾

- `index.html`：公開入口網站
- `data/simulations.json`：分類與模擬程式清單
- `simulations/`：單檔 HTML 模擬程式
- `admin/`：本地後台工具，不會被部署到 GitHub Pages
- `tools/`：Codex 或本機可用的上架與報表工具

## 新增模擬

本地後台：

1. 開啟 `admin/index.html`
2. 輸入預設密碼 `gogoland-admin`
3. 選擇本 repo 資料夾
4. 選擇分類、上傳 HTML，送出後會更新 `simulations/` 與 `data/simulations.json`

Codex 或終端機：

```bash
npm run register -- --file path/to/new.html --category science --title "新模擬" --description "一句話簡介" --tags "關鍵字1,關鍵字2"
```

## GitHub Pages

請在 repo 的 Pages 設定中選擇 GitHub Actions。`deploy-pages.yml` 只會部署公開檔案，不會部署 `admin/`。

## 每日流量報告

`daily-traffic-report.yml` 會在台灣時間每天晚上 8 點執行。需要在 GitHub Secrets 設定：

- `GA4_PROPERTY_ID`
- `GA4_SERVICE_ACCOUNT_JSON`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

網站前端的 GA4 Measurement ID 請填在 `assets/js/analytics-config.js`。

GA4 後台需建立事件參數自訂維度 `simulation_title`，每日報告才能依模擬程式分組。
