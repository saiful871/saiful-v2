/**
 * AutoTyping Effect (Full Working Version)
 * ----------------------------------------
 * Works on all Mirai-based bots (rX Modded, GoatBot, etc.)
 * Shows typing effect (delay before message send)
 * 
 * Credits: rX Abdullah + Saiful Islam (Final Fix)
 */

const delay = ms => new Promise(res => setTimeout(res, ms));

module.exports.config = {
  name: "autoTyping",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "rX Abdullah + Saiful Islam",
  description: "Simulate typing effect for all outgoing messages (universal support)",
  commandCategory: "system",
  usages: "auto typing effect",
  cooldowns: 1,
};

module.exports.handleEvent = async function({ api }) {
  // Prevent multiple injection
  if (api._autoTypingEnabled) return;
  api._autoTypingEnabled = true;

  // Backup original sendMessage function
  const originalSendMessage = api.sendMessage;

  // Patch sendMessage globally
  api.sendMessage = async function(message, threadID, callback, messageID) {
    try {
      let text = "";

      // detect message body
      if (typeof message === "string") text = message;
      else if (message && message.body) text = message.body;
      else text = "";

      // calculate realistic typing delay
      const delayTime = Math.min(5000, Math.max(800, text.length * 60));

      // Show log for debugging (you’ll see in console)
      console.log(`[AutoTyping] Simulating typing for ${delayTime}ms before sending message...`);

      // Try sending typing indicator if API supports
      try {
        if (typeof api.sendTypingIndicator === "function") {
          api.sendTypingIndicator(threadID, true);
        }
      } catch (e) {
        // ignored
      }

      // Wait before sending
      await delay(delayTime);

      // Stop typing indicator if possible
      try {
        if (typeof api.sendTypingIndicator === "function") {
          api.sendTypingIndicator(threadID, false);
        }
      } catch (e) {}

      // Finally send message
      return originalSendMessage.call(api, message, threadID, callback, messageID);
    } catch (err) {
      console.error("❌ AutoTyping Error:", err);
      // fallback to normal sendMessage
      return originalSendMessage.call(api, message, threadID, callback, messageID);
    }
  };

  console.log("✅ AutoTyping is now active globally for all messages!");
};
