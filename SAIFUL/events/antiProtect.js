const fs = require("fs-extra");
const axios = require("axios");

module.exports.config = {
  name: "antiProtect",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "SHAHADAT SAHU",
  description: "Protects group name, photo and nicknames",
  eventType: ["log:thread-name", "log:thread-icon", "log:user-nickname"],
  cooldowns: 3
};

module.exports.run = async function({ api, event, Threads, Users }) {
  try {
    const threadID = event.threadID;
    const senderID = event.author || event.senderID;
    const cacheDir = `${__dirname}/../../cache/antiProtect/`;
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const settingsFile = `${cacheDir}settings.json`;
    let settings = {};
    if (fs.existsSync(settingsFile)) {
      try { settings = JSON.parse(fs.readFileSync(settingsFile)); } catch {}
    }
    if (settings[threadID] === false) return;

    const threadInfo = await api.getThreadInfo(threadID);
    const adminIDs = (threadInfo.adminIDs || []).map(u => u.id);
    const botOwners = ["100001039692046"];
    const isAdmin = adminIDs.includes(senderID) || botOwners.includes(senderID);

    const cacheFile = `${cacheDir}${threadID}.json`;
    if (!fs.existsSync(cacheFile)) {
      const snapshot = {
        name: threadInfo.threadName || "Unnamed Group",
        imageSrc: threadInfo.imageSrc || null,
        nicknames: threadInfo.nicknames || {}
      };
      fs.writeFileSync(cacheFile, JSON.stringify(snapshot, null, 2));
      return;
    }

    if (isAdmin) {
      const newSnapshot = {
        name: threadInfo.threadName,
        imageSrc: threadInfo.imageSrc,
        nicknames: threadInfo.nicknames || {}
      };
      fs.writeFileSync(cacheFile, JSON.stringify(newSnapshot, null, 2));
      return;
    }

    const oldData = JSON.parse(fs.readFileSync(cacheFile));
    const userName = await Users.getNameUser(senderID).catch(() => "Someone");
    const botID = api.getCurrentUserID();
    const botIsAdmin = adminIDs.includes(botID);

    switch (event.logMessageType) {
      case "log:thread-name": {
        await api.setTitle(oldData.name, threadID).catch(() => {});
        return api.sendMessage(`🚫 ${userName} tried to change the group name!\nName reverted → "${oldData.name}" ✅`, threadID);
      }
      case "log:thread-icon": {
        try {
          if (oldData.imageSrc) {
            const res = await axios.get(oldData.imageSrc, { responseType: "arraybuffer" });
            const buffer = Buffer.from(res.data, "binary");
            await api.changeGroupImage(buffer, threadID);
          } else {
            await api.changeGroupImage(null, threadID).catch(() => {});
          }
        } catch {}
        return api.sendMessage(`🚫 ${userName} tried to change the group photo!\nPrevious photo restored ✅`, threadID);
      }
      case "log:user-nickname": {
        const data = event.logMessageData || {};
        const userID = data.participant_id || data.user_id || data.target_id || (data?.changed && data.changed[0]) || null;
        if (!userID) return;
        if (!botIsAdmin) {
          try { await api.sendMessage("⚠️ I need to be a group admin to restore nicknames.", threadID); } catch {}
          return;
        }
        const oldNick = (oldData.nicknames && (oldData.nicknames[userID] !== undefined ? oldData.nicknames[userID] : "")) || "";
        setTimeout(async () => { try { await api.changeNickname(oldNick, threadID, userID); } catch {} }, 800);
        return api.sendMessage(`🚫 ${userName} tried to change a nickname!\nNickname has been reverted ✅`, threadID);
      }
      default:
        return;
    }
  } catch (error) {
    console.log("AntiProtect Error:", error);
  }
};
