const axios = require("axios");

module.exports.config = {
  name: "typingreply",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Saiful Islam (Mirai Version)",
  description: "Simulate typing effect before sending a reply",
  commandCategory: "utility",
  usages: "[message]",
  cooldowns: 3,
};

module.exports.run = async function({ api, event, args }) {
  const messageText = args.join(" ") || "Hello from bot 👋";

  try {
    // Step 1: send "typing_on" effect
    api.sendTypingIndicator(event.threadID, true);
    console.log("Typing indicator sent...");

    // Step 2: wait before sending (simulate typing delay)
    const baseDelayPerChar = 60; // milliseconds per character
    let delayMs = Math.min(Math.max(messageText.length * baseDelayPerChar, 1000), 6000);
    delayMs += Math.floor(Math.random() * 800); // random delay for natural typing feel
    await new Promise(resolve => setTimeout(resolve, delayMs));

    // Step 3: send actual message
    api.sendMessage(messageText, event.threadID, event.messageID);

    // Step 4: stop typing indicator
    api.sendTypingIndicator(event.threadID, false);
    console.log("Message sent successfully!");
  } catch (error) {
    console.error("Typing reply failed:", error);
    api.sendMessage("⚠️ Something went wrong while typing!", event.threadID, event.messageID);
  }
};
