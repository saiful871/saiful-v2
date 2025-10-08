module.exports.config = {
  name: "joinnoti",
  eventType: ["log:subscribe"],
  version: "2.0.0",
  credits: "SAIFUL ISLAM",
  description: "Stylish upgraded welcome with profile pic, emojis, and colorful layout"
};

module.exports.run = async function ({ api, event, Users, Threads }) {
  const { threadID, logMessageData, author } = event;
  const addedMembers = logMessageData.addedParticipants || [];
  const threadInfo = await api.getThreadInfo(threadID);
  const threadName = threadInfo.threadName || "this group";
  const memberCount = threadInfo.participantIDs.length;
  const adderName = await Users.getNameUser(author);

  for (const participant of addedMembers) {
    const userID = participant.userFbId;
    const userName = await Users.getNameUser(userID);

    // Get profile picture
    let avatar = `https://graph.facebook.com/${userID}/picture?type=large`;

    const msg = `━━━━━━━━━━━━━━━━━━
🎉 🌟 𝗡𝗘𝗪 𝗝𝗢𝗜𝗡𝗘𝗥 𝗔𝗟𝗘𝗥𝗧 🌟 🎉
━━━━━━━━━━━━━━━━━━
🚀 𝗡𝗔𝗠𝗘 : ${userName}
🏷️ 𝗚𝗥𝗢𝗨𝗣 : ${threadName}
🔢 𝗠𝗘𝗠𝗕𝗘𝗥 𝗡𝗢 : ${memberCount}
🧑‍💼 𝗔𝗗𝗗𝗘𝗗 𝗕𝗬 : ${adderName}

📣 ${adderName} ${userName}-কে এই গ্রুপে যুক্ত করেছেন!  

✨ হেই ${userName}!
🌸 স্বাগতম *${threadName}*-এ 🌈
💬 আশা করি এখানে তোমার সময় হবে অসাধারণ এবং মজার!
🤝 চল সবাই মিলে আনন্দঘন মুহূর্ত বানাই 💖

🌐 ᴡᴇʟᴄᴏᴍᴇ 𝗳𝗿𝗼𝗺 SAIFUL'ꜱ ᴄʜᴀᴛ ʙᴏᴛ 🤖
🛡️ 𝗖𝗿𝗲𝗮𝘁𝗲𝗱 𝗯𝘆 : SAIFUL ISLAM
━━━━━━━━━━━━━━━━━━`;

    api.sendMessage({
      body: msg,
      mentions: [
        { tag: userName, id: userID },
        { tag: adderName, id: author }
      ],
      attachment: (await global.nodemodule["axios"]
        .get(avatar, { responseType: "arraybuffer" })
        .then(res => Buffer.from(res.data, "utf-8")))
    }, threadID);
  }
};
