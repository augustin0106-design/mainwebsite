import { google } from "googleapis";
import nodemailer from "nodemailer";

const {
  GA4_PROPERTY_ID,
  GA4_SERVICE_ACCOUNT_JSON,
  REPORT_EMAIL_TO,
  SMTP_HOST,
  SMTP_PORT = "587",
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM = SMTP_USER,
} = process.env;

function requireEnv(name, value) {
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

function metricValue(row, index) {
  return Number(row.metricValues?.[index]?.value || 0);
}

function dimensionValue(row, index) {
  return row.dimensionValues?.[index]?.value || "(not set)";
}

async function runReport() {
  const credentials = JSON.parse(requireEnv("GA4_SERVICE_ACCOUNT_JSON", GA4_SERVICE_ACCOUNT_JSON));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
  });
  const analyticsData = google.analyticsdata({ version: "v1beta", auth });
  const property = `properties/${requireEnv("GA4_PROPERTY_ID", GA4_PROPERTY_ID)}`;

  const [overview, simulations, engagement] = await Promise.all([
    analyticsData.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
        metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }, { name: "averageSessionDuration" }],
      },
    }),
    analyticsData.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
        dimensions: [{ name: "customEvent:simulation_title" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            stringFilter: { value: "simulation_open" },
          },
        },
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: 50,
      },
    }),
    analyticsData.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
        dimensions: [{ name: "customEvent:simulation_title" }],
        metrics: [{ name: "eventValue" }],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            stringFilter: { value: "simulation_engagement" },
          },
        },
        orderBys: [{ metric: { metricName: "eventValue" }, desc: true }],
        limit: 50,
      },
    }),
  ]);

  const row = overview.data.rows?.[0];
  const totalViews = row ? metricValue(row, 0) : 0;
  const activeUsers = row ? metricValue(row, 1) : 0;
  const avgDurationSeconds = row ? metricValue(row, 2) : 0;
  const simRows = simulations.data.rows || [];
  const engagementRows = engagement.data.rows || [];

  const lines = [
    "駿佾老師的Gogoland 每日流量報告",
    "",
    `總瀏覽量：${totalViews}`,
    `活躍使用者：${activeUsers}`,
    `平均工作階段時間：${Math.round(avgDurationSeconds)} 秒`,
    "",
    "各模擬程式點擊次數：",
    ...(simRows.length ? simRows.map((simRow, index) => `${index + 1}. ${dimensionValue(simRow, 0)}：${metricValue(simRow, 0)} 次`) : ["目前沒有模擬點擊事件"]),
    "",
    "各模擬程式停留時間：",
    ...(engagementRows.length ? engagementRows.map((engagementRow, index) => `${index + 1}. ${dimensionValue(engagementRow, 0)}：${Math.round(metricValue(engagementRow, 0))} 秒`) : ["目前沒有模擬停留時間事件"]),
    "",
    "提醒：停留時間由前端事件累計，關閉分頁或切換模擬時回報，數字適合教學網站營運觀察。"
  ];

  const transporter = nodemailer.createTransport({
    host: requireEnv("SMTP_HOST", SMTP_HOST),
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: requireEnv("SMTP_USER", SMTP_USER),
      pass: requireEnv("SMTP_PASS", SMTP_PASS),
    },
  });

  await transporter.sendMail({
    from: SMTP_FROM,
    to: requireEnv("REPORT_EMAIL_TO", REPORT_EMAIL_TO),
    subject: "駿佾老師的Gogoland 每日流量報告",
    text: lines.join("\n"),
  });
}

runReport().catch((error) => {
  console.error(error);
  process.exit(1);
});
