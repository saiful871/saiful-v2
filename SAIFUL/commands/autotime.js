const axios = require("axios");
const moment = require("moment-timezone");
require("moment/locale/bn");

module.exports.config = {
  name: "autotime",
  version: "1.4.0",
  hasPermssion: 0,
  credits: "Sairul Islam",
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

// ==================== AutoTime Function ====================
async function sendTimeUpdate(api, threadID) {
  try {
    const now = moment().tz("Asia/Dhaka");

    const engDate = now.format("dddd, DD MMMM YYYY");
    const engTime = now.format("hh:mm A");

    const bnDayName = banglaDays[now.day()];
    const bnDate = now.date();
    const bnMonth = banglaMonths[now.month()];
    const bnYear = now.year() - 593;
    const bnTime = now.locale("bn").format("hh A");

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
      if (res.data?.data?.hijri) {
        const hijri = res.data.data.hijri;
        hijriDay = hijri.day;
        hijriMonth = hijri.month.ar;
        hijriYear = hijri.year;
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
          সময়: ${bnTimePeriod} ${bnTime} টা
       ╚════════╝
🗓️ English: ${engDate}
🗓️ বাংলা: ${bnDayName}, ${bnDate} ${bnMonth}, ${bnYear} বঙ্গাব্দ
🌙 হিজরি: ${hijriDay} ${hijriMonth} ${hijriYear} হিজরি
🌍 টাইমজোন: Asia/Dhaka 
━━━━━━━━━━━━━━━━━━━━
✨ আল্লাহর নিকটে বেশি বেশি দোয়া করুন..! 
🙏 ৫ ওয়াক্ত নামাজ নিয়মিত পড়ুন..!
🤝 সকলের সাথে সদ্ভাব বজায় রাখুন..!
━━━━━━━━━━━━━━━━━━━━
🌸✨🌙🕊️🌼🌿🕌💖🌙🌸✨🌺

🌟 𝐂𝐫𝐞𝐚𝐭𝐨𝐫 ━ 𝐒𝐚𝐢𝐫𝐮𝐥 𝐈𝐬𝐥𝐚𝐦 🌟`;

    api.sendMessage(message.trim(), threadID);

  } catch (err) {
    console.error("AutoTime Error:", err);
  }
}

// ==================== Default Auto Start ====================
module.exports.onLoad = function ({ api }) {
  console.log("✅ AutoTime system loaded and will run hourly by default!");

  if (global.data.allThreadIDs) {
    global.data.allThreadIDs.forEach(threadID => {
      const now = moment().tz("Asia/Dhaka");
      const nextHour = moment(now).add(1, "hour").startOf("hour");
      const msUntilNextHour = nextHour.diff(now);

      setTimeout(() => {
        sendTimeUpdate(api, threadID);
        setInterval(() => sendTimeUpdate(api, threadID), 60 * 60 * 1000);
      }, msUntilNextHour);
    });
  }
};

// ==================== Command Handler ====================
module.exports.run = async function ({ api, event }) {
  return api.sendMessage(
    "🕒 𝗔𝘂𝘁𝗼𝗧𝗶𝗺𝗲 সিস্টেম ডিফল্টভাবে অন আছে!\nপ্রতি ঘন্টায় স্বয়ংক্রিয়ভাবে সময় পাঠানো হবে ⏰",
    event.threadID,
    event.messageID
  );
};
