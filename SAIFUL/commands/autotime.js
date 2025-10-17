const moment = require("moment-timezone");
const axios = require("axios");

module.exports.config = {
  name: "autotime",
  version: "9.0.0",
  hasPermssion: 2,
  credits: "Saiful Modify by rX",
  description: "প্রতি ঘন্টা বাংলা ও হিজরি তারিখ দেখাবে",
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

// GitHub থেকে হিজরি (আরবি) তারিখ ফেচ
async function fetchHijriDate(now) {
  try {
    const year = now.year();
    const month = now.month() + 1;
    const day = now.date();

    const url = `https://raw.githubusercontent.com/rummmmna21/rX-/refs/heads/main/arabic-2025-2026.json`;
    const res = await axios.get(url);
    const data = res.data;

    if (data[month] && data[month][day]) {
      return data[month][day]; // { day, month, year }
    }
    return { day: "??", month: "??", year: "??" };
  } catch (e) {
    console.error(e);
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
    pohelaBoishakh = moment(`${gYear-1}-04-14`).dayOfYear();
  }

  let dayCount = dayOfYear - pohelaBoishakh + 1;
  if (dayCount <= 0) dayCount += moment(`${gYear}-12-31`).dayOfYear();

  const monthLengths = [31,31,31,31,31,30,30,30,30,30,30,30];
  let monthIndex = 0;
  while(dayCount > monthLengths[monthIndex]) {
    dayCount -= monthLengths[monthIndex];
    monthIndex = (monthIndex + 1) % 12;
  }

  return { day: toBanglaNumber(dayCount), month: banglaMonths[monthIndex], year: toBanglaNumber(banglaYear), weekday: banglaWeekdays[now.day()] };
}

// মেসেজ পাঠানো
async function sendTime(api, threadID) {
  if (!runningGroups.has(threadID)) return;

  const timeZone = "Asia/Dhaka";
  const now = moment().tz(timeZone);
  const time = now.format("hh:mm A");
  const date = now.format("DD/MM/YYYY, dddd");

  const bangla = getBanglaDate(now);
  const hijri = await fetchHijriDate(now);

  const msg = `
⏰ সময়: ${time}
📅 ইংরেজি তারিখ: ${date}
🗓️ বাংলা তারিখ: ${bangla.day} ${bangla.month}, ${bangla.year} (${bangla.weekday})
🌙 হিজরি তারিখ: ${hijri.day} ${hijri.month}, ${hijri.year}
🌍 টাইমজোন: ${timeZone}
`;

  api.sendMessage(msg, threadID);
}

// কমান্ড চালু
module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  if (runningGroups.has(threadID)) return api.sendMessage("⏰ AutoTime ইতিমধ্যে চলছে!", threadID);

  runningGroups.add(threadID);
  api.sendMessage("✅ AutoTime চালু হয়েছে।", threadID);

  const now = moment().tz("Asia/Dhaka");
  const nextHour = now.clone().add(1, "hour").startOf("hour");
  const delay = nextHour.diff(now);

  setTimeout(function tick() {
    if (!runningGroups.has(threadID)) return;
    sendTime(api, threadID);
    setInterval(() => { if (runningGroups.has(threadID)) sendTime(api, threadID); }, 60*60*1000);
  }, delay);
};

module.exports.handleEvent = async function ({ api, event }) {
  const threadID = event.threadID;
  if (!runningGroups.has(threadID)) {
    runningGroups.add(threadID);
    const now = moment().tz("Asia/Dhaka");
    const nextHour = now.clone().add(1,"hour").startOf("hour");
    const delay = nextHour.diff(now);
    setTimeout(function tick() {
      if (!runningGroups.has(threadID)) return;
      sendTime(api, threadID);
      setInterval(() => { if (runningGroups.has(threadID)) sendTime(api, threadID); }, 60*60*1000);
    }, delay);
  }
};
