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
💀 ɴᴇᴡ ᴇɴᴛʀʏ ᴅᴇᴛᴇᴄᴛᴇᴅ 💀
━━━━━━━━━━━━━━━━━━
🚀 ɴᴀᴍᴇ : {name}
💠 ɢʀᴏᴜᴘ : {threadName}
🔰 ᴍᴇᴍʙᴇʀ ɴᴏ : {soThanhVien}
👤 ᴀᴅᴅᴇᴅ ʙʏ : {addedBy}

🌐 ᴡᴇʟᴄᴏᴍᴇ ғʀᴏᴍ SAIFUL'ꜱ ᴄʜᴀᴛ ʙᴏᴛ 🤖
🛰️ ᴄʀᴇᴀᴛᴇᴅ ʙʏ : SAIFUL ISLAM
━━━━━━━━━━━━━━━━━━`;

    api.sendMessage({ body: msg, mentions: mention }, threadID);
  }
};
