const axios = require("axios");

// 🔸 Load Base API URL
let simsim = "";
(async () => {
  try {
    const res = await axios.get("https://raw.githubusercontent.com/rummmmna21/rx-api/main/baseApiUrl.json");
    if (res.data && res.data.baby) simsim = res.data.baby;
  } catch {}
})();

// 🔸 Delay Function (for typing effect)
const delay = ms => new Promise(res => setTimeout(res, ms));

// ✅ Baby AI Configuration
module.exports.config = {
  name: "baby",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "rX Abdullah + Saiful Combo Fix",
  description: "AI Chatbot with Teach, List & Auto Typing effect",
  commandCategory: "chat",
  usages: "[query]",
  cooldowns: 0,
  prefix: false
};

// ✅ AutoTyping Wrapper
async function sendWithTyping(api, message, threadID, callback, messageID) {
  try {
    let msgBody = "";
    if (typeof message === "string") msgBody = message;
    else if (message && message.body) msgBody = message.body;

    const delayTime = Math.min(5000, Math.max(800, msgBody.length * 60));
    console.log(`[AutoTyping] Simulating typing for ${delayTime}ms before sending...`);

    if (typeof api.sendTypingIndicator === "function") {
      try {
        api.sendTypingIndicator(threadID, true);
      } catch {}
    }

    await delay(delayTime);

    if (typeof api.sendTypingIndicator === "function") {
      try {
        api.sendTypingIndicator(threadID, false);
      } catch {}
    }

    return api.sendMessage(message, threadID, callback, messageID);
  } catch (err) {
    console.error("❌ AutoTyping Error:", err);
    return api.sendMessage(message, threadID, callback, messageID);
  }
}

// ✅ Main Baby AI Run
module.exports.run = async function({ api, event, args, Users }) {
  const uid = event.senderID;
  const senderName = await Users.getNameUser(uid);
  const query = args.join(" ").toLowerCase();

  try {
    if (!simsim) return sendWithTyping(api, "❌ API not loaded yet.", event.threadID, event.messageID);

    if (args[0] === "autoteach") {
      const mode = args[1];
      if (!["on", "off"].includes(mode))
        return sendWithTyping(api, "✅ Use: baby autoteach on/off", event.threadID, event.messageID);

      const status = mode === "on";
      await axios.post(`${simsim}/setting`, { autoTeach: status });
      return sendWithTyping(api, `✅ Auto teach is now ${status ? "ON 🟢" : "OFF 🔴"}`, event.threadID, event.messageID);
    }

    if (args[0] === "list") {
      const res = await axios.get(`${simsim}/list`);
      const msg = `╭─╼🌟 𝐁𝐚𝐛𝐲 𝐀𝐈 𝐒𝐭𝐚𝐭𝐮𝐬\n├ 📝 𝐓𝐞𝐚𝐜𝐡𝐞𝐝 𝐐𝐮𝐞𝐬𝐭𝐢𝐨𝐧𝐬: ${res.data.totalQuestions}\n├ 📦 𝐒𝐭𝐨𝐫𝐞𝐝 𝐑𝐞𝐩𝐥𝐢𝐞𝐬: ${res.data.totalReplies}\n╰─╼👤 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫: 𝐫𝐗 𝐀𝐛𝐝𝐮𝐥𝐥𝐚𝐡`;
      return sendWithTyping(api, msg, event.threadID, event.messageID);
    }

    if (args[0] === "msg") {
      const trigger = args.slice(1).join(" ").trim();
      if (!trigger) return sendWithTyping(api, "❌ | Use: !baby msg [trigger]", event.threadID, event.messageID);

      const res = await axios.get(`${simsim}/simsimi-list?ask=${encodeURIComponent(trigger)}`);
      if (!res.data.replies || res.data.replies.length === 0)
        return sendWithTyping(api, "❌ No replies found.", event.threadID, event.messageID);

      const formatted = res.data.replies.map((rep, i) => `➤ ${i + 1}. ${rep}`).join("\n");
      const msg = `📌 𝗧𝗿𝗶𝗴𝗴𝗲𝗿: ${trigger.toUpperCase()}\n📋 𝗧𝗼𝘁𝗮𝗹: ${res.data.total}\n━━━━━━━━━━━━━━\n${formatted}`;
      return sendWithTyping(api, msg, event.threadID, event.messageID);
    }

    if (args[0] === "teach") {
      const parts = query.replace("teach ", "").split(" - ");
      if (parts.length < 2)
        return sendWithTyping(api, "❌ | Use: teach [Question] - [Reply]", event.threadID, event.messageID);

      const [ask, ans] = parts;
      const res = await axios.get(`${simsim}/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&senderID=${uid}&senderName=${encodeURIComponent(senderName)}`);
      return sendWithTyping(api, `✅ ${res.data.message}`, event.threadID, event.messageID);
    }

    if (args[0] === "edit") {
      const parts = query.replace("edit ", "").split(" - ");
      if (parts.length < 3)
        return sendWithTyping(api, "❌ | Use: edit [Question] - [OldReply] - [NewReply]", event.threadID, event.messageID);

      const [ask, oldR, newR] = parts;
      const res = await axios.get(`${simsim}/edit?ask=${encodeURIComponent(ask)}&old=${encodeURIComponent(oldR)}&new=${encodeURIComponent(newR)}`);
      return sendWithTyping(api, res.data.message, event.threadID, event.messageID);
    }

    if (["remove", "rm"].includes(args[0])) {
      const parts = query.replace(/^(remove|rm)\s*/, "").split(" - ");
      if (parts.length < 2)
        return sendWithTyping(api, "❌ | Use: remove [Question] - [Reply]", event.threadID, event.messageID);

      const [ask, ans] = parts;
      const res = await axios.get(`${simsim}/delete?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}`);
      return sendWithTyping(api, res.data.message, event.threadID, event.messageID);
    }

    if (!query) {
      const texts = ["Hey baby 💖", "Yes, I'm here 😘"];
      const reply = texts[Math.floor(Math.random() * texts.length)];
      return sendWithTyping(api, reply, event.threadID);
    }

    const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
    return sendWithTyping(api, res.data.response, event.threadID, (err, info) => {
      if (!err) {
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: event.senderID,
          type: "simsimi"
        });
      }
    }, event.messageID);
  } catch (e) {
    return sendWithTyping(api, `❌ Error: ${e.message}`, event.threadID, event.messageID);
  }
};

// ✅ HandleReply
module.exports.handleReply = async function({ api, event, Users }) {
  const senderName = await Users.getNameUser(event.senderID);
  const text = event.body?.toLowerCase();
  if (!text || !simsim) return;

  try {
    const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(text)}&senderName=${encodeURIComponent(senderName)}`);
    return sendWithTyping(api, res.data.response, event.threadID, (err, info) => {
      if (!err) {
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: event.senderID,
          type: "simsimi"
        });
      }
    }, event.messageID);
  } catch (e) {
    return sendWithTyping(api, `❌ Error: ${e.message}`, event.threadID, event.messageID);
  }
};

// ✅ handleEvent (AutoTeach + triggers)
module.exports.handleEvent = async function({ api, event, Users }) {
  const text = event.body?.toLowerCase().trim();
  if (!text || !simsim) return;

  const senderName = await Users.getNameUser(event.senderID);
  const triggers = ["baby", "bby", "xan", "bbz", "mari", "মারিয়া", " Baby"];

  if (triggers.includes(text)) {
    const replies = [
      "𝐀𝐬𝐬𝐚𝐥𝐚𝐦𝐮 𝐰𝐚𝐥𝐚𝐢𝐤𝐮𝐦 ♥",
      "বলেন sir__😌",
      "𝐁𝐨𝐥𝐨 𝐣𝐚𝐧 𝐤𝐢 𝐤𝐨𝐫𝐭𝐞 𝐩𝐚𝐫𝐢 𝐭𝐦𝐫 𝐣𝐨𝐧𝐧𝐨 🐸",
      "𝐋𝐞𝐛𝐮 𝐤𝐡𝐚𝐰 𝐝𝐚𝐤𝐭𝐞 𝐝𝐚𝐤𝐭𝐞 𝐭𝐨 𝐡𝐚𝐩𝐚𝐲 𝐠𝐞𝐬𝐨",
      "𝐆𝐚𝐧𝐣𝐚 𝐤𝐡𝐚 𝐦𝐚𝐧𝐮𝐬𝐡 𝐡𝐨 🍁",
      "মুড়ি খাও 🫥",
      "──‎ 𝐇𝐮𝐌..? 👉👈",
      "কি হলো, মিস টিস করচ্ছো নাকি 🤣",
      "𝐓𝐫𝐮𝐬𝐭 𝐦𝐞 𝐢𝐚𝐦 𝐦𝐚𝐫𝐢𝐚 🧃"
    ];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    return sendWithTyping(api, reply, event.threadID, (err, info) => {
      if (!err) {
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: event.senderID,
          type: "simsimi"
        });
      }
    });
  }

  const matchPrefix = /^(baby|bby|xan|bbz|mari|মারিয়া)\s+/i;
  if (matchPrefix.test(text)) {
    const query = text.replace(matchPrefix, "").trim();
    if (!query) return;

    try {
      const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
      return sendWithTyping(api, res.data.response, event.threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "simsimi"
          });
        }
      }, event.messageID);
    } catch (e) {
      return sendWithTyping(api, `❌ Error: ${e.message}`, event.threadID, event.messageID);
    }
  }

  // AutoTeach system
  if (event.type === "message_reply") {
    try {
      const setting = await axios.get(`${simsim}/setting`);
      if (!setting.data.autoTeach) return;

      const ask = event.messageReply.body?.toLowerCase().trim();
      const ans = event.body?.toLowerCase().trim();
      if (!ask || !ans || ask === ans) return;

      setTimeout(async () => {
        try {
          await axios.get(`${simsim}/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&senderName=${encodeURIComponent(senderName)}`);
          console.log("✅ Auto-taught:", ask, "→", ans);
        } catch (err) {
          console.error("❌ Auto-teach internal error:", err.message);
        }
      }, 300);
    } catch (e) {
      console.log("❌ Auto-teach setting error:", e.message);
    }
  }
};
