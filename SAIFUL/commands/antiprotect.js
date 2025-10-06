const fs = require("fs-extra");

module.exports.config = {
  name: "antiprotect",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "SHAHADAT SAHU",
  description: "Turn antiProtect ON or OFF for this thread",
  usages: "on | off | status",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args, Threads, Users }) {
  try {
    const threadID = event.threadID;
    const senderID = event.author || event.senderID;
    const threadInfo = await api.getThreadInfo(threadID);
    const adminIDs = (threadInfo.adminIDs || []).map(u => u.id);
    const botOwners = ["100001039692046"];
    if (!adminIDs.includes(senderID) && !botOwners.includes(senderID)) return api.sendMessage("❌ You must be a thread admin to use this command.", threadID);

    const cacheDir = `${__dirname}/../../cache/antiProtect/`;
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const settingsFile = `${cacheDir}settings.json`;
    let settings = {};
    if (fs.existsSync(settingsFile)) {
      try { settings = JSON.parse(fs.readFileSync(settingsFile)); } catch { settings = {}; }
    }

    const sub = (args && args[0]) ? args[0].toLowerCase() : null;
    if (!sub || (sub !== "on" && sub !== "off" && sub !== "status")) return api.sendMessage("Usage: antiprotect on | off | status", threadID);

    if (sub === "status") {
      const enabled = settings[threadID] === undefined ? true : !!settings[threadID];
      return api.sendMessage(`AntiProtect is currently ${enabled ? "ON" : "OFF"} for this thread.`, threadID);
    }

    settings[threadID] = sub === "on";
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
    return api.sendMessage(`✅ AntiProtect has been turned ${sub === "on" ? "ON" : "OFF"} for this thread.`, threadID);

  } catch (err) {
    console.log("antiprotect command error:", err);
    return api.sendMessage("An error occurred while processing the command.", event.threadID);
  }
};
