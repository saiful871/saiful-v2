module.exports.config = {
  name: "joinnoti",
  eventType: ["log:subscribe"],
  version: "1.0.7",
  credits: "Mohammad Akash",
  description: "Premium Auto Welcome Message with New Member & Adder Tag"
};

module.exports.run = async function ({ api, event, Users }) {
  const { threadID, logMessageData } = event;
  const addedMembers = logMessageData.addedParticipants || [];
  const adderID = logMessageData.author || null; // যে অ্যাড করেছে

  const adderName = adderID ? await Users.getNameUser(adderID) : "Admin";
  const adderMention = adderID ? [{ id: adderID, tag: adderName }] : [];

  for (let member of addedMembers) {
    const userName = await Users.getNameUser(member.userFbId);
    const mention = [{ id: member.userFbId, tag: userName }, ...adderMention];

    const msg = 
`━━━━━━━━━━━━━━━━━━
🎉 𝗡𝗘𝗪 𝗝𝗢𝗜𝗡𝗘𝗥 𝗔𝗟𝗘𝗥𝗧 🎉
━━━━━━━━━━━━━━━━━━
🚀 𝗡𝗔𝗠𝗘 : ${name}
🏷️ 𝗚𝗥𝗢𝗨𝗣 : ${threadName}
🔢 𝗠𝗘𝗠𝗕𝗘𝗥 𝗡𝗢 : ${soThanhVien}
🧑‍💼 𝗔𝗗𝗗𝗘𝗗 𝗕𝗬 : ${addedBy}

📣 ${addedBy} ${name}-কে এই গ্রুপে যুক্ত করেছেন!  

✨ হেই ${name}!  
🌸 স্বাগতম *${threadName}*-এ 🌈  
💬 আশা করি এখানে তোমার সময় হবে অসাধারণ এবং মজার!  
🤝 চল সবাই মিলে আনন্দঘন মুহূর্ত বানাই 💖

🌐 ᴡᴇʟᴄᴏᴍᴇ 𝗳𝗿𝗼𝗺 SAIFUL'ꜱ ᴄʜᴀᴛ ʙᴏᴛ 🤖  
🛡️ 𝗖𝗿𝗲𝗮𝘁𝗲𝗱 𝗯𝘆 : SAIFUL ISLAM
━━━━━━━━━━━━━━━━━━`;

    api.sendMessage({ body: msg, mentions: mention }, threadID);
  }
};
