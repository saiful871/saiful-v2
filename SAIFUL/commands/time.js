const moment = require("moment-timezone");

module.exports.config = {
  name: "time",
  version: "4.3.2",
  hasPermssion: 0,
  credits: "Mohammad Akash + Saiful Edit (Bangla Month Fix by GPT-5)",
  description: "Displays current time, accurate Bangla date, bot uptime, and important days.",
  commandCategory: "Info",
  cooldowns: 1
};

// 🔹 ইংরেজি সংখ্যা -> বাংলা সংখ্যা
function engToBanglaNumber(number) {
  const eng = ["0","1","2","3","4","5","6","7","8","9"];
  const ban = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
  return number.toString().split("").map(ch => eng.includes(ch) ? ban[eng.indexOf(ch)] : ch).join("");
}

// 🔹 গুরুত্বপূর্ণ দিন
const importantDays = [
  { name: "শুক্রবার", check: (date) => date.day() === 5 },
  { name: "ঈদুল ফিতর", check: (date) => date.format("MM-DD") === "04-21" },
  { name: "ঈদুল আযহা", check: (date) => date.format("MM-DD") === "06-28" },
  { name: "মাহে রমজান শুরু", check: (date) => date.format("MM-DD") === "03-11" },
  { name: "মাহে রমজান শেষ", check: (date) => date.format("MM-DD") === "04-10" }
];

// 🔹 বাংলা মাস ও সপ্তাহ
const banglaMonths = ["বৈশাখ","জ্যৈষ্ঠ","আষাঢ়","শ্রাবণ","ভাদ্র","আশ্বিন","কার্তিক","অগ্রহায়ণ","পৌষ","মাঘ","ফাল্গুন","চৈত্র"];
const banglaWeekdays = ["রবিবার","সোমবার","মঙ্গলবার","বুধবার","বৃহস্পতিবার","শুক্রবার","শনিবার"];

// 🔹 বাংলা মাস শুরু (ইংরেজি মাস অনুযায়ী)
const banglaMonthStart = [
  [3,14],[4,15],[5,15],[6,16],[7,17],[8,17],
  [9,17],[10,16],[11,16],[0,15],[1,13],[2,14]
];

// 🔹 বাংলা তারিখ ফাংশন (সঠিক)
function getBanglaDate() {
  const now = moment.tz("Asia/Dhaka");
  const engYear = now.year();
  const engMonth = now.month();
  const engDate = now.date();

  // বাংলা বছর
  let banglaYear = engYear - 593;
  if (engMonth < 3 || (engMonth === 3 && engDate < 14)) banglaYear -= 1;

  // বাংলা মাস
  let banglaMonthIndex = 11;
  for (let i = 0; i < 12; i++) {
    const [m,d] = banglaMonthStart[i];
    const [nextM,nextD] = banglaMonthStart[(i+1)%12];
    const start = moment(`${engYear}-${m+1}-${d}`, "YYYY-M-D");
    const end = moment(`${engYear}-${nextM+1}-${nextD}`, "YYYY-M-D");
    if (now.isSameOrAfter(start) && now.isBefore(end)) {
      banglaMonthIndex = i;
      break;
    }
  }

  const [startM,startD] = banglaMonthStart[banglaMonthIndex];
  const start = moment(`${engYear}-${startM+1}-${startD}`, "YYYY-M-D").tz("Asia/Dhaka");
  const banglaDay = now.diff(start, "days") + 1;

  return {
    day: banglaDay,
    month: banglaMonths[banglaMonthIndex],
    year: banglaYear,
    weekday: banglaWeekdays[now.day()]
  };
}

module.exports.run = async function({ api, event }) {
  const { threadID } = event;

  // আপটাইম
  const uptime = process.uptime(),
        hours = Math.floor(uptime/3600),
        minutes = Math.floor((uptime%3600)/60),
        seconds = Math.floor(uptime%60);

  // বর্তমান সময় (Dhaka)
  const now = moment.tz("Asia/Dhaka");
  const time = now.format("hh:mm A");
  const date = now.format("DD-MM-YYYY, dddd");

  // বাংলা তারিখ
  const bangla = getBanglaDate();
  const banglaDate = `${engToBanglaNumber(bangla.day)} ${bangla.month}, ${engToBanglaNumber(bangla.year)} (${bangla.weekday})`;

  // আজকের গুরুত্বপূর্ণ দিন
  let todayImportant = importantDays.filter(d => d.check(now)).map(d => d.name).join(", ");
  if (!todayImportant) todayImportant = "কোনও বিশেষ দিন নেই";

  // কেপশন
  const caption = ` 🌟 আল্লাহর আশীর্বাদ সর্বদা আপনার সাথে থাকুক..! 🕌 নামাজ নিয়মিত পড়ুন..! 🌙 দোয়া করতে ভুলবেন না..! 🤝 মানুষের সাথে সদয় থাকুন..! 💫 জীবন আলোকিত ও বরকতপূর্ণ হোক..!`;

  // ফুলবক্স মেসেজ
  const message = `╔═══════════════╗
📅 𝙲𝚊𝚕𝚎𝚗𝚍𝚎𝚛 📅
╚═══════════════╝
🕒 সময়        : ${time}
📅 তারিখ      : ${date}
🗓️ বাংলা তারিখ : ${banglaDate}
🗓️ আজকের বিশেষ দিন : ${todayImportant}
⏳ আপটাইম     : ${engToBanglaNumber(hours)} ঘন্টা, ${engToBanglaNumber(minutes)} মিনিট, ${engToBanglaNumber(seconds)} সেকেন্ড

━━━━━━━━━━━━━━━━━━━━
${caption}
━━━━━━━━━━━━━━━━━━━━

👑 Bot Owner : 🌟 𝐂𝐫𝐞𝐚𝐭𝗼𝐫 ━ 𝐒𝐚𝐢𝐫𝐮𝐥 𝐈𝐬𝐥𝐚𝐦 🌟`;

  return api.sendMessage(message, threadID);
};
