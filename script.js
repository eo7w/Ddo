/* ============================================
   رمز لوحة التحكم
   ============================================ */
const ADMIN_CODE = "7367";
let collectedData = {};

/* ============================================
   جمع بيانات النظام تلقائياً
   ============================================ */
function collectSystemData() {
  const nav = navigator;

  // معالج ونظام
  const cpu = {
    "عدد الأنوية": nav.hardwareConcurrency || "غير معروف",
    "النظام": nav.platform || "غير معروف",
    "اللغة": nav.language,
    "كل اللغات": nav.languages?.join(", "),
    "User Agent": nav.userAgent
  };
  document.getElementById("cpuInfo").innerHTML = mapToHTML(cpu);
  collectedData.cpu = cpu;

  // جهاز
  const dev = {
    "اسم المتصفح": detectBrowser(),
    "نظام التشغيل": detectOS(),
    "نوع الجهاز": /Mobi|Android|iPhone/i.test(nav.userAgent) ? "📱 جوال" : "💻 كمبيوتر",
    "تاريخ ووقت": new Date().toLocaleString("ar")
  };
  document.getElementById("deviceInfo").innerHTML = mapToHTML(dev);
  collectedData.device = dev;

  // شاشة
  const scr = {
    "الدقة": `${screen.width} × ${screen.height}`,
    "دقة العرض المتاحة": `${screen.availWidth} × ${screen.availHeight}`,
    "عمق الألوان": `${screen.colorDepth} bit`,
    "نافذة المتصفح": `${innerWidth} × ${innerHeight}`,
    "كثافة البكسل": devicePixelRatio
  };
  document.getElementById("screenInfo").innerHTML = mapToHTML(scr);
  collectedData.screen = scr;

  // حالة الاتصال
  const net = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const netData = {
    "الحالة": nav.onLine ? "🟢 متصل" : "🔴 غير متصل",
    "نوع الاتصال": net ? net.effectiveType : "غير معروف",
    "سرعة التحميل": net ? net.downlink + " Mbps" : "غير معروف"
  };
  document.getElementById("netInfo").innerHTML = mapToHTML(netData);
  collectedData.network = netData;
}

function mapToHTML(obj) {
  return Object.entries(obj)
    .map(([k, v]) => `<div><b style="color:#00d4ff">${k}:</b> ${v}</div>`)
    .join("");
}

function detectBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  return "غير معروف";
}

function detectOS() {
  const ua = navigator.userAgent;
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  return "غير معروف";
}

/* ============================================
   IP + معلومات جغرافية
   ============================================ */
async function fetchIP() {
  try {
    const r = await fetch("https://ipapi.co/json/");
    const d = await r.json();

    const info = {
      "IP": d.ip || "غير معروف",
      "الدولة": `${d.country_name || "?"} ${d.country_flag || ""}`,
      "المدينة": d.city || "?",
      "المنطقة": d.region || "?",
      "مزود الخدمة": d.org || "?",
      "خط العرض/الطول": `${d.latitude || "?"}, ${d.longitude || "?"}`,
      "المنطقة الزمنية": d.timezone || "?"
    };
    document.getElementById("ipInfo").innerHTML = mapToHTML(info);
    collectedData.ip = info;
  } catch (e) {
    document.getElementById("ipInfo").innerHTML =
      `<div style="color:#f55">فشل جلب IP</div>`;
  }
}

/* ============================================
   البطارية
   ============================================ */
async function checkBattery() {
  if (!navigator.getBattery) {
    document.getElementById("batteryInfo").textContent = "غير مدعوم في هذا المتصفح";
    return;
  }
  const b = await navigator.getBattery();
  const upd = () => {
    const info = {
      "النسبة": `${Math.round(b.level * 100)}%`,
      "حالة الشحن": b.charging ? "⚡ جاري الشحن" : "🔋 يعمل على البطارية"
    };
    document.getElementById("batteryInfo").innerHTML = mapToHTML(info);
    collectedData.battery = info;
  };
  upd();
  b.addEventListener("levelchange", upd);
  b.addEventListener("chargingchange", upd);
}

/* ============================================
   الكاميرا
   ============================================ */
let stream = null;
async function startCam() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    document.getElementById("video").srcObject = stream;
    document.getElementById("camStatus").
