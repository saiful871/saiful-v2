const moment = require("moment-timezone");

module.exports.config = {
  name: "autotime",
  version: "7.0.0",
  hasPermssion: 2,
  credits: "Saiful",
  description: "বট চালু হলেই প্রতি ঘন্টা সময়, বাংলা তারিখ ও দোয়া পাঠাবে",
  commandCategory: "system",
  usages: "autotime",
  cooldowns: 5,
};

const runningGroups = new Set();

// বাংলা মাস ও সপ্তাহের নাম
const banglaMonths = [
  "বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", "ভাদ্র", "আশ্বিন",
  "কার্তিক", "অগ্রহায়ণ", "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র"
];

const banglaWeekdays = [
  "রবিবার", "সোমবার", "মঙ্গলবার",
  "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"
];

const banglaDigits = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];

// ইংরেজি সংখ্যা বাংলায় রূপান্তর
function toBanglaNumber(num) {
  return num.toString().replace(/\d/g, d => banglaDigits[d]);
}

// বাংলা তারিখ গণনা (সঠিক)
function getBanglaDate(now) {
  const gYear = now.year();
  const gMonth = now.month() + 1; // 1-12
  const gDay = now.date();

  // Pohela Boishakh: 14 April (14-04) গ্রেগরিয়ান
  let banglaYear = gYear - 593;
  let dayOfYear = moment(now).dayOfYear();
  let pohelaBoishakh = moment(`${gYear}-04-14`, "YYYY-MM-DD").dayOfYear();

  if (dayOfYear < pohelaBoishakh) {
    banglaYear--;
    pohelaBoishakh = moment(`${gYear-1}-04-14`, "YYYY-MM-DD").dayOfYear();
  }

  let dayCount = dayOfYear - pohelaBoishakh + 1;
  if (dayCount <= 0) dayCount += moment(`${gYear}-12-31`, "YYYY-MM-DD").dayOfYear();

  // মাসের দৈর্ঘ্য বাংলা ক্যালেন্ডার অনুযায়ী
  const monthLengths = [31,31,31,31,31,30,30,30,30,30,30,30]; // Approximate
  let monthIndex = 0;
  while(dayCount > monthLengths[monthIndex]) {
    dayCount -= monthLengths[monthIndex];
    monthIndex = (monthIndex + 1) % 12;
  }

  const weekday = banglaWeekdays[now.day()];

  return {
    day: toBanglaNumber(dayCount),
    month: banglaMonths[monthIndex],
    year: toBanglaNumber(banglaYear),
    weekday
  };
}

function sendTime(api, threadID) {
  if (!runningGroups.has(threadID)) return;

  const timeZone = "Asia/Dhaka";
  const now = moment().tz(timeZone);
  const time = now.format("hh:mm A");
  const date = now.format("DD/MM/YYYY, dddd");
  const bangla = getBanglaDate(now);

  const msg = `
╔═❖═❖═❖═❖═❖═❖═╗
 ⏰ 𝗧𝗜𝗠𝗘 & 𝗗𝗔𝗧𝗘 ⏰
╚═❖═❖═❖═❖═❖═❖═╝
    ╔═✪═🕒═✪═╗
    সময়: ${time}
    ╚════════╝
📅 ইংরেজি তারিখ: ${date}
🗓️ বাংলা তারিখ: ${bangla.day} ${bangla.month}, ${bangla.year} (${bangla.weekday})
🌍 টাইমজোন: ${timeZone}
━━━━━━━━━━━━━━━━━━━━
✨ আল্লাহর নিকটে বেশি বেশি দোয়া করুন..! 
🙏 ৫ ওয়াক্ত নামাজ নিয়মিত পড়ুন..!
🤝 সকলের সাথে সদ্ভাব বজায় রাখুন..!
━━━━━━━━━━━━━━━━━━━━
🌸✨🌙🕊️🌼🌿🕌💖🌙🌸✨🌺

🌟 𝐂𝐫𝐞𝐚𝐭𝐨𝐫 ━ 𝐒𝐚𝐢𝐟𝐮𝐥 𝐈𝐬𝐥𝐚𝐦 🌟
`;

  api.sendMessage(msg, threadID);
}

// রানার ফাংশন একই থাকবে
module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;

  if (runningGroups.has(threadID)) {
    return api.sendMessage("⏰ এই গ্রুপে ইতিমধ্যে AutoTime চলছে!", threadID);
  }

  runningGroups.add(threadID);
  api.sendMessage("✅ বট চালু হয়েছে। এখন থেকে প্রতি ঘন্টা সময়, তারিখ ও দোয়া পাঠানো হবে।", threadID);

  const timeZone = "Asia/Dhaka";
  const now = moment().tz(timeZone);
  const nextHour = now.clone().add(1, "hour").startOf("hour");
  let delay = nextHour.diff(now);

  setTimeout(function tick() {
    if (!runningGroups.has(threadID)) return;

    sendTime(api, threadID);

    setInterval(() => {
      if (!runningGroups.has(threadID)) return;
      sendTime(api, threadID);
    }, 60 * 60 * 1000);

  }, delay);
};

module.exports.handleEvent = async function ({ api, event }) {
  const threadID = event.threadID;

  if (!runningGroups.has(threadID)) {
    runningGroups.add(threadID);

    const timeZone = "Asia/Dhaka";
    const now = moment().tz(timeZone);
    const nextHour = now.clone().add(1, "hour").startOf("hour");
    let delay = nextHour.diff(now);

    setTimeout(function tick() {
      if (!runningGroups.has(threadID)) return;

      sendTime(api, threadID);

      setInterval(() => {
        if (!runningGroups.has(threadID)) return;
        sendTime(api, threadID);
      }, 60 * 60 * 1000);

    }, delay);
  }
};
