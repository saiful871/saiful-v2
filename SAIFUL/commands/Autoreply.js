const fs = global.nodemodule["fs-extra"];
const path = global.nodemodule["path"];

module.exports.config = {
  name: "autoreplybot",
  version: "6.0.2",
  hasPermssion: 0,
  credits: "𝐒𝐡𝐚𝐡𝐚𝐝𝐚𝐭 𝐈𝐬𝐥𝐚𝐦",
  description: "Auto-response bot with specified triggers",
  commandCategory: "No Prefix",
  usages: "[any trigger]",
  cooldowns: 3,
};

module.exports.handleEvent = async function ({ api, event, Users }) {
  const { threadID, messageID, senderID, body } = event;
  if (!body) return; 
  const name = await Users.getNameUser(senderID);
  const msg = body.toLowerCase().trim();

  const responses = {
    "miss you": "অরেক বেডারে Miss না করে xan মেয়ে হলে বস Saiful রে হাঙ্গা করো😶👻😘",
    "kiss de": "কিস দিস না তোর মুখে দূর গন্ধ কয়দিন ধরে দাঁত ব্রাশ করিস নাই🤬",
    "👍": "সর এখান থেকে লাইকার আবাল..!🐸🤣👍⛏️",
    "help": "Prefix de sala",
    "hi": "এত হাই-হ্যালো কর ক্যান প্রিও..!😜🫵",
    "😦": "হায়রে! 😦",
    "আসসালামু আলাইকুম": "ওয়া আলাইকুমুস সালাম 🤲✨ কেমন আছেন?",
    "Assalamu Alaikum": "Wa Alaikum Assalam 🤍",
    "bal": "💥🔥🩸 S̴A̴L̴A̴ 💀⚡✨ 🌪️ T̴O̴R̴  B̴A̴L̴  E̴T̴O̴  B̴A̴L̴ B̴A̴L̴   K̴O̴R̴C̴H̴  K̴E̴N̴❗💫 ✂️ H̴A̴T̴E̴  D̴H̴O̴R̴A̴I̴  D̴I̴B̴O̴ 😈💥💀",
    "🇵🇸": "༆🇵🇸𝗙𝗿𝗲𝗲 𝗙𝗿𝗲𝗲 𝗽𝗮𝗹𝗲𝘀𝘁𝗶𝗻𝗲🇵🇸༆",
};
  if (responses[msg]) {
    return api.sendMessage(responses[msg], threadID, messageID);
  }
};

module.exports.run = async function ({ api, event, args, Users }) {
  return this.handleEvent({ api, event, Users });
};
