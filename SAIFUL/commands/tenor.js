!install tenor.js /* 
  This code official owner is rX Abdullah
  ============= (Maria × rX Chatbot) ==========
  Command: tenor
  Description: Search GIFs from Tenor and send result
*/

const axios = require("axios");
const fs = require("fs");
const path = require("path");

const API_KEY = "AIzaSyDB5FyCegbX6g0Be01R189Kwa_W0nMKRsg"; // your Tenor API key
const SEARCH_URL = "https://g.tenor.com/v1/search";
const CACHE_DIR = path.join(__dirname, "../../modules/events/cache");

if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

module.exports.config = {
  name: "tenor",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX Abdullah + ChatGPT",
  description: "Search GIFs from Tenor and send to chat",
  commandCategory: "media",
  usages: "[keyword]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  if (!args[0]) return api.sendMessage("🔍 | দয়া করে কোনো শব্দ লিখুন যেমন: !tenor happy", event.threadID, event.messageID);

  const query = args.join(" ");
  const waitMsg = await api.sendMessage(`🔎 Searching Tenor for “${query}” ...`, event.threadID, event.messageID);

  try {
    const res = await axios.get(SEARCH_URL, {
      params: { q: query, key: API_KEY, limit: 10 }
    });

    const results = res.data.results;
    if (!results || results.length === 0) {
      api.unsendMessage(waitMsg.messageID);
      return api.sendMessage("😢 কোনো ফলাফল পাওয়া যায়নি!", event.threadID);
    }

    // Pick random gif
    const pick = results[Math.floor(Math.random() * results.length)];
    const media = pick.media[0];
    const gifUrl = media.gif?.url || media.mp4?.url || media.mediumgif?.url;

    if (!gifUrl) {
      api.unsendMessage(waitMsg.messageID);
      return api.sendMessage("❌ GIF URL পাওয়া যায়নি।", event.threadID);
    }

    // Download file to cache
    const fileName = `tenor_${Date.now()}.gif`;
    const filePath = path.join(CACHE_DIR, fileName);
    const file = fs.createWriteStream(filePath);
    const gifRes = await axios.get(gifUrl, { responseType: "stream" });
    gifRes.data.pipe(file);

    file.on("finish", async () => {
      api.unsendMessage(waitMsg.messageID);
      await api.sendMessage(
        {
          body: `🎬 Result for “${query}”`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => fs.unlinkSync(filePath)
      );
    });
  } catch (err) {
    console.error(err);
    api.unsendMessage(waitMsg.messageID);
    api.sendMessage("❌ কিছু সমস্যা হয়েছে, আবার চেষ্টা করুন!", event.threadID);
  }
};
