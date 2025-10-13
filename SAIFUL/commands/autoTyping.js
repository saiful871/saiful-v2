module.exports.config = {
  name: "autoTyping",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "rX Abdullah + Saiful Edit",
  description: "Auto typing effect for all messages (Mirai Bot)",
  commandCategory: "system",
  usages: "",
  cooldowns: 1,
};

module.exports.handleEvent = async function({ api }) {
  // Prevent multiple overrides
  if (api._typingEnabled) return;
  api._typingEnabled = true;

  // Backup original sendMessage
  const originalSendMessage = api.sendMessage;

  // Override sendMessage function globally
  api.sendMessage = function(message, threadID, callback, messageID) {
    try {
      // Enable typing indicator
      api.sendTypingIndicator(threadID, true);

      // Calculate delay time based on message length
      let delay = 1200;
      if (typeof message === "string") {
        delay = Math.min(5000, Math.max(800, message.length * 80));
      } else if (message?.body) {
        delay = Math.min(5000, Math.max(800, message.body.length * 80));
      }

      // Stop typing and send message after delay
      setTimeout(() => {
        api.sendTypingIndicator(threadID, false);
        originalSendMessage.call(api, message, threadID, callback, messageID);
      }, delay);
    } catch (err) {
      console.log("⚠️ AutoTyping Error:", err);
      // fallback
      originalSendMessage.call(api, message, threadID, callback, messageID);
    }
  };
};
