const axios = require("axios");
const moment = require("moment-timezone");
require("moment/locale/bn");

module.exports.config = {
  name: "autotime",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "Sairul Islam",
  description: "Auto Time System with Bangla, English & Hijri Calendar",
  commandCategory: "Utility",
  cooldowns: 5,
};

const banglaMonths = [
  "বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", "ভাদ্র", "আশ্বিন",
  "কার্তিক", "অগ্রহায়ণ", "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র"
];

const banglaDays = [
  "রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"
];

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;

  api.sendMessage("✅ Auto Time System Started!", threadID);

  setInterval(async () => {
    try {
      const now = moment().tz("Asia/Dhaka");

      const engDate = now.format("dddd, DD MMMM YYYY");
      const engTime = now.format("hh:mm A");

      const bnDayName = banglaDays[now.day()];
      const bnDate = now.date();
      const bnMonth = banglaMonths[now.month()];
      const bnYear = now.year() - 593;
      const bnTime = now.locale("bn").format("hh:mm A");

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

      const finalMessage = `
╔═❖═❖═❖═❖═❖═❖═╗
 ⏰ 𝗧𝗜𝗠𝗘 & 𝗗𝗔𝗧𝗘 ⏰
╚═❖═❖═❖═❖═❖═❖═╝
       ╔═✪═🕒═✪═╗
          সময়: ${bnTimePeriod} ${bnTime}
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

      api.sendMessage(finalMessage.trim(), threadID);
    } catch (error) {
      console.error("AutoTime Error:", error);
    }
  }, 3600000);
};
