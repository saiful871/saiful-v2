const axios = require("axios");
const moment = require("moment-timezone");

module.exports.config = {
  name: "autotime",
  version: "8.5.0",
  hasPermssion: 2,
  credits: "rX Abdullah",
  description: "Auto send time & date every hour in all groups",
  commandCategory: "utility",
  cooldowns: 3
};

module.exports.run = async function ({ api }) {
  const githubUrl = "https://raw.githubusercontent.com/rummmmna21/rX-/main/autotime.json";

  async function sendToAllThreads() {
    try {
      const res = await axios.get(githubUrl);
      const data = res.data;
      const timezone = "Asia/Dhaka";
      const now = moment().tz(timezone);
      const englishDate = now.format("dddd, DD MMMM YYYY");
      const time = now.format("hh:mm A").replace("AM", "সকাল").replace("PM", "রাত");
      const todayData = data.dates.find(d => d.english.includes(englishDate));

      const msg = `
╔═❖═❖═❖═❖═❖═❖═╗
 ⏰ 𝗧𝗜𝗠𝗘 & 𝗗𝗔𝗧𝗘 ⏰
╚═❖═❖═❖═❖═❖═❖═╝
       ╔═✪═🕒═✪═╗
          সময়: ${time}
       ╚════════╝
🗓️ English: ${todayData?.english || englishDate}
🗓️ বাংলা: ${todayData?.bangla || "N/A"}
🌙 হিজরি: ${todayData?.hijri || "N/A"}
🌍 টাইমজোন: ${timezone}
━━━━━━━━━━━━━━━━━━━━
✨ আল্লাহর নিকটে বেশি বেশি দোয়া করুন..! 
🙏 ৫ ওয়াক্ত নামাজ নিয়মিত পড়ুন..!
🤝 সকলের সাথে সদ্ভাব বজায় রাখুন..!
━━━━━━━━━━━━━━━━━━━━
🌸✨🌙🕊️🌼🌿🕌💖🌙🌸✨🌺

🌟 𝐂𝐫𝐞𝐚𝐭𝐨𝐫 ━ 𝐒𝐚𝐢𝐫𝐮𝐥 𝐈𝐬𝐥𝐚𝐦 🌟`;

      const threads = await api.getThreadList(100, null, ["INBOX"]);
      for (const thread of threads) {
        if (thread.isGroup) {
          api.sendMessage(msg, thread.threadID);
        }
      }

    } catch (err) {
      console.error("AutoTime Error:", err);
    }
  }

  await sendToAllThreads();
  setInterval(sendToAllThreads, 60 * 60 * 1000); // প্রতি ১ ঘণ্টায় auto run
};
