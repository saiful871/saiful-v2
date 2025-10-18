const axios = require("axios");
const moment = require("moment-timezone");
require("moment/locale/bn");

module.exports.config = {
  name: "autotime",
  version: "1.4.1",
  hasPermssion: 0,
  credits: "Sairul Islam (modified)",
  description: "Auto time hourly update (Bangla, English & Hijri, Default ON)",
  commandCategory: "Utility",
  cooldowns: 5,
};

const banglaMonths = [
  "বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", "ভাদ্র", "আশ্বিন",
  "কার্তিক", "অগ্রহায়ণ", "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র"
];

const banglaDays = [
  "রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার",
  "বৃহস্পতিবার", "শুক্রবার", "শনিবার"
];

// একটি map যাতে থ্রেড마다 একবারই টাইমার চলবে
let timers = {};

/** Convert English digits to Bangla digits */
function toBanglaNumber(str) {
  const map = { "0":"০","1":"১","2":"২","3":"৩","4":"৪","5":"৫","6":"৬","7":"৭","8":"৮","9":"৯" };
  return str.toString().split("").map(c => map[c] !== undefined ? map[c] : c).join("");
}

async function sendTimeUpdate(api, threadID) {
  try {
    const now = moment().tz("Asia/Dhaka");

    const engDate = now.format("dddd, DD MMMM YYYY");
    const engTime = now.format("hh:mm A");

    const bnDayName = banglaDays[now.day()];
    const bnDate = now.date();
    const bnMonth = banglaMonths[now.month()];
    const bnYear = now.year() - 593;  // বঙ্গাব্দ বছর
    // Bangla time (hh A) but convert numerals
    const bnTime = now.locale("bn").format("hh A");
    const bnTimeBangla = toBanglaNumber(bnTime);

    const hour = now.hour();
    let bnTimePeriod;
    if (hour >= 4 && hour < 12) bnTimePeriod = "সকাল";
    else if (hour >= 12 && hour < 17) bnTimePeriod = "দুপুর";
    else if (hour >= 17 && hour < 20) bnTimePeriod = "বিকাল";
    else bnTimePeriod = "রাত";

    const today = now.format("DD-MM-YYYY");
    let hijriDay, hijriMonth, hijriYear;
    try {
      const res = await axios.get(`http://api.aladhan.com/v1/gToH?date=${today}`);
      if (res.data && res.data.data && res.data.data.hijri) {
        const h = res.data.data.hijri;
        hijriDay = toBanglaNumber(h.day);
        // h.month.ar is Arabic month name (in Arabic script). যদি তুমি ইংরেজি চান তাহলে h.month.en
        hijriMonth = h.month.en || h.month.ar;
        hijriYear = toBanglaNumber(h.year);
      } else {
        hijriDay = hijriMonth = hijriYear = "N/A";
      }
    } catch (err) {
      hijriDay = hijriMonth = hijriYear = "Error";
      console.error("Hijri API Error:", err.message);
    }

    const message = `
╔═❖═❖═❖═❖═❖═❖═╗
 ⏰ 𝗧𝗜𝗠𝗘 & 𝗗𝗔𝗧𝗘 ⏰
╚═❖═❖═❖═❖═❖═❖═╝
       ╔═✪═🕒═✪═╗
          সময়: ${bnTimePeriod} ${bnTimeBangla} টা
       ╚════════╝
🗓️ English: ${engDate}
🗓️ বাংলা: ${bnDayName}, ${toBanglaNumber(bnDate)} ${bnMonth}, ${toBanglaNumber(bnYear)} বঙ্গাব্দ
🌙 হিজরি: ${hijriDay} ${hijriMonth} ${hijriYear} হিজরি
🌍 টাইমজোন: Asia/Dhaka
━━━━━━━━━━━━━━━━━━━━
✨ আল্লাহর নিকটে বেশি বেশি দোয়া করুন..! 
🙏 ৫ ওয়াক্ত নামাজ নিয়মিত পড়ুন..!
🤝 সকলের সাথে সদ্ভাব বজায় রাখুন..!
━━━━━━━━━━━━━━━━━━━━
🌸✨🌙🕊️🌼🌿🕌💖🌙🌸✨🌺

🌟 𝐂𝐫𝐞𝐚𝐭𝐨𝐫 ━ 𝐒𝐚𝐢𝐫𝐮𝐥 𝐈𝐬𝐥𝐚𝐦 🌟
`.trim();

    // পাঠাও মেসেজ
    api.sendMessage(message, threadID);

  } catch (err) {
    console.error("AutoTime Error:", err);
  }
}

module.exports.onLoad = function ({ api }) {
  console.log("✅ AutoTime module loaded.");

  // যদি global.data.allThreadIDs থাকে
  if (global.data && global.data.allThreadIDs) {
    global.data.allThreadIDs.forEach(threadID => {
      // যদি ইতিমধ্যে টাইমার সেট করা থাকে, ওভারল্যাপ এড়াও
      if (timers[threadID]) return;

      const now = moment().tz("Asia/Dhaka");
      const nextHour = moment(now).add(1, "hour").startOf("hour");
      const msUntilNextHour = nextHour.diff(now);

      // একটি timeout দিয়ে শুরু করো
      timers[threadID] = true;

      setTimeout(() => {
        sendTimeUpdate(api, threadID);

        // এরপর প্রতি ঘন্টায়
        timers[threadID] = setInterval(() => {
          sendTimeUpdate(api, threadID);
        }, 60 * 60 * 1000);

      }, msUntilNextHour);
    });
  }
};

module.exports.run = async function ({ api, event }) {
  // চালিয়ে দাও ম্যানুয়ালি
  sendTimeUpdate(api, event.threadID);
};
