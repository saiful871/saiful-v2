const moment = require("moment-timezone");
const axios = require("axios");

module.exports.config = {
  name: "autotime",
  version: "9.1.0",
  hasPermssion: 2,
  credits: "Saiful Islam + Modified by GPT-5",
  description: "প্রতি ঘন্টা বাংলা ও হিজরি তারিখ দেখাবে সুন্দর ডিজাইনে",
  commandCategory: "system",
  usages: "autotime",
  cooldowns: 5,
};

const runningGroups = new Set();

// বাংলা মাস, সপ্তাহ
const banglaMonths = ["বৈশাখ","জ্যৈষ্ঠ","আষাঢ়","শ্রাবণ","ভাদ্র","আশ্বিন","কার্তিক","অগ্রহায়ণ","পৌষ","মাঘ","ফাল্গুন","চৈত্র"];
const banglaWeekdays = ["রবিবার","সোমবার","মঙ্গলবার","বুধবার","বৃহস্পতিবার","শুক্রবার","শনিবার"];
const banglaDigits = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];

// ইংরেজি সংখ্যাকে বাংলায় রূপান্তর
function toBanglaNumber(num) {
  return num.toString().replace(/\d/g, d => banglaDigits[d]);
}

// GitHub থেকে হিজরি তারিখ (বাংলা ভার্সনে)
async function fetchHijriDate(now) {
  try {
    const year = now.year();
    const month = now.month() + 1;
    const day = now.date();
    const url = `https://raw.githubusercontent.com/rummmmna21/rX-/refs/heads/main/arabic-2025-2026.json`;

    const res = await axios.get(url);
    const data = res.data;

    if (data[month] && data[month][day]) {
      const hijri = data[month][day];
      return {
        day: toBanglaNumber(hijri.day),
        month: hijri.month,
        year: toBanglaNumber(hijri.year)
      };
    }
    return { day: "??", month: "??", year: "??" };
  } catch {
    return { day: "??", month: "??", year: "??" };
  }
}

// বাংলা তারিখ গণনা
function getBanglaDate(now) {
  const gYear = now.year();
  const gMonth = now.month() + 1;
  const gDay = now.date();

  let banglaYear = gYear - 593;
  let dayOfYear = moment(now).dayOfYear();
  let pohelaBoishakh = moment(`${gYear}-04-14`).dayOfYear();

  if (dayOfYear < pohelaBoishakh) {
    banglaYear--;
    pohelaBoishakh = moment(`${gYear - 1}-04-14`).dayOfYear();
  }

  let dayCount = dayOfYear - pohelaBoishakh + 1;
  if (dayCount <= 0) dayCount += moment(`${gYear}-12-31`).dayOfYear();

  const monthLengths = [31,31,31,31,31,30,30,30,30,30,30,30];
  let monthIndex = 0;
  while (dayCount > monthLengths[monthIndex]) {
    dayCount -= monthLengths[monthIndex];
    monthIndex = (monthIndex + 1) % 12;
  }

  return {
    day: toBanglaNumber(dayCount),
    month: banglaMonths[monthIndex],
    year: toBanglaNumber(banglaYear),
    weekday: banglaWeekdays[now.day()]
  };
}

// সময় পাঠানো
async function sendTime(api, threadID) {
  if (!runningGroups.has(threadID)) return;

  const timeZone = "Asia/Dhaka";
  const now = moment().tz(timeZone);
  const time = now.format("hh:mm A");
  const englishDate = now.format("dddd, DD MMMM YYYY");

  const bangla = getBanglaDate(now);
  const hijri = await fetchHijriDate(now);

  const msg = `
╔═❖═❖═❖═❖═❖═❖═╗
 ⏰ 𝗧𝗜𝗠𝗘 & 𝗗𝗔𝗧𝗘 ⏰
╚═❖═❖═❖═❖═❖═❖═╝
       ╔═✪═🕒═✪═╗
          সময়: ${time}
       ╚════════╝
🗓️ English: ${englishDate}
🗓️ বাংলা: ${bangla.weekday}, ${bangla.day} ${bangla.month}, ${bangla.year} বঙ্গাব্দ
🌙 হিজরি: ${hijri.day} ${hijri.month} ${hijri.year} হিজরি
🌍 টাইমজোন: ${timeZone}
━━━━━━━━━━━━━━━━━━━━
✨ আল্লাহর নিকটে বেশি বেশি দোয়া করুন..! 
🙏 ৫ ওয়াক্ত নামাজ নিয়মিত পড়ুন..!
🤝 সকলের সাথে সদ্ভাব বজায় রাখুন..!
━━━━━━━━━━━━━━━━━━━━
🌸✨🌙🕊️🌼🌿🕌💖🌙🌸✨🌺
╔═❖═❖═❖═❖═❖═❖═╗
👑 𝐁𝐨𝐭 𝐎𝐰𝐧𝐞𝐫: 𝐒𝐚𝐢𝐫𝐮𝐥 𝐈𝐬𝐥𝐚𝐦  
╚═❖═❖═❖═❖═❖═❖═╝
`;

  api.sendMessage(msg, threadID);
}

// কমান্ড চালু
module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  if (runningGroups.has(threadID))
    return api.sendMessage("⏰ AutoTime ইতিমধ্যে চলছে!", threadID);

  runningGroups.add(threadID);
  api.sendMessage("✅ AutoTime চালু হয়েছে। প্রতি ঘন্টায় সময় ও তারিখ আপডেট হবে।", threadID);

  const now = moment().tz("Asia/Dhaka");
  const nextHour = now.clone().add(1, "hour").startOf("hour");
  const delay = nextHour.diff(now);

  setTimeout(function tick() {
    if (!runningGroups.has(threadID)) return;
    sendTime(api, threadID);
    setInterval(() => {
      if (runningGroups.has(threadID)) sendTime(api, threadID);
    }, 60 * 60 * 1000);
  }, delay);
};

// অটো চালু রাখার জন্য
module.exports.handleEvent = async function ({ api, event }) {
  const threadID = event.threadID;
  if (!runningGroups.has(threadID)) {
    runningGroups.add(threadID);
    const now = moment().tz("Asia/Dhaka");
    const nextHour = now.clone().add(1, "hour").startOf("hour");
    const delay = nextHour.diff(now);
    setTimeout(function tick() {
      if (!runningGroups.has(threadID)) return;
      sendTime(api, threadID);
      setInterval(() => {
        if (runningGroups.has(threadID)) sendTime(api, threadID);
      }, 60 * 60 * 1000);
    }, delay);
  }
};
