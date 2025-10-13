const delay = ms => new Promise(res => setTimeout(res, ms));

module.exports.config = {
  name: "autoTyping",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "rX Abdullah + Saiful Fix Final",
  description: "Simulates typing effect before sending every message (works on all Mirai mods)",
  commandCategory: "system",
  usages: "",
  cooldowns: 1,
};

module.exports.handleEvent = async function({ api }) {
  // prevent multiple injection
  if (api._autoTypingPatched) return;
  api._autoTypingPatched = true;

  // backup original sendMessage
  const originalSendMessage = api.sendMessage;

  api.sendMessage = async function(message, threadID, callback, messageID) {
    try {
      let msgBody = "";
      if (typeof message === "string") msgBody = message;
      else if (message && message.body) msgBody = message.body;

      // calculate delay (simulate typing speed)
      const delayTime = Math.min(5000, Math.max(800, msgBody.length * 60));

      // log for debugging
      console.log(`[AutoTyping] Typing for ${delayTime}ms before sending message to ${threadID}...`);

      // try sending typing indicator (if API supports)
      try {
        if (typeof api.sendTypingIndicator === "function") {
          api.sendTypingIndicator(threadID, true);
        }
      } catch (e) {
        // ignore if not supported
      }

      // wait before actually sending
      await delay(delayTime);

      // stop typing if supported
      try {
        if (typeof api.sendTypingIndicator === "function") {
          api.sendTypingIndicator(threadID, false);
        }
      } catch (e) {}

      // finally send the message
      return originalSendMessage.call(api, message, threadID, callback, messageID);
    } catch (err) {
      console.error("❌ AutoTyping Error:", err);
      return originalSendMessage.call(api, message, threadID, callback, messageID);
    }
  };

  console.log("✅ AutoTyping module activated successfully!");
};
