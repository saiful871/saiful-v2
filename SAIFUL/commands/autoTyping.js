const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports.config = {
  name: "autoTyping",
  version: "1.1.2",
  hasPermssion: 0,
  credits: "rX Abdullah + Saiful Fix",
  description: "Auto typing effect for all outgoing messages (Mirai Bot)",
  commandCategory: "system",
  usages: "",
  cooldowns: 1,
};

module.exports.handleEvent = async function({ api }) {
  if (api._autoTypingPatched) return; // prevent duplicate patch
  api._autoTypingPatched = true;

  const originalSendMessage = api.sendMessage;

  api.sendMessage = async function(message, threadID, callback, messageID) {
    try {
      // calculate delay time
      let delayTime = 1200;
      const msgText = typeof message === "string" ? message : message?.body || "";

      if (msgText.length > 0) {
        delayTime = Math.min(5000, Math.max(800, msgText.length * 50));
      }

      // send typing indicator (if supported)
      if (api.sendTypingIndicator) {
        api.sendTypingIndicator(threadID, true);
      } else {
        // fallback: simulate typing via delay
        console.log(`[Typing Effect] ${delayTime}ms before sending...`);
      }

      // wait before sending
      await delay(delayTime);

      if (api.sendTypingIndicator) {
        api.sendTypingIndicator(threadID, false);
      }

      return originalSendMessage.call(api, message, threadID, callback, messageID);
    } catch (err) {
      console.error("⚠️ AutoTyping Error:", err);
      return originalSendMessage.call(api, message, threadID, callback, messageID);
    }
  };

  console.log("✅ AutoTyping effect is now enabled globally.");
};
