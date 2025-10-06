module.exports.config = {
  name: "groupupdate",
  eventType: ["log:thread-name","log:thread-icon","log:thread-admins","log:user-nickname","log:thread-color"],
  version: "1.0.1",
  credits: "Mohammad Akash",
  description: "Premium Stylish Group Update Notifications"
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID, logMessageData } = event;

  // 🎨 Theme / Color Change
  if(event.logMessageType === "log:thread-color") {
    const newColor = logMessageData.color;
    api.sendMessage(`🎨━━━━━━━━━━━━━━━━🎨\n✨ 𝐓𝐇𝐄𝐌𝐄 𝐔𝐏𝐃𝐀𝐓𝐄 ✨\n🎨━━━━━━━━━━━━━━━━🎨\n\n💠 𝐓𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 𝐜𝐨𝐥𝐨𝐫/𝐭𝐡𝐞𝐦𝐞 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐜𝐡𝐚𝐧𝐠𝐞𝐝 𝐭𝐨: ${newColor}\n\n🎨━━━━━━━━━━━━━━━━🎨`, threadID);
  }

  // 🖼️ Group Icon / Emoji Change
  if(event.logMessageType === "log:thread-icon") {
    api.sendMessage(`🖼️━━━━━━━━━━━━━━━━🖼️\n✨ 𝐈𝐂𝐎𝐍 𝐔𝐏𝐃𝐀𝐓𝐄 ✨\n🖼️━━━━━━━━━━━━━━━━🖼️\n\n💠 𝐆𝐫𝐨𝐮𝐩 𝐢𝐜𝐨𝐧 / 𝐞𝐦𝐨𝐣𝐢 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐜𝐡𝐚𝐧𝐠𝐞𝐝 ✅\n\n🖼️━━━━━━━━━━━━━━━━🖼️`, threadID);
  }

  // 👑 Admin Added / Removed
  if(event.logMessageType === "log:thread-admins") {
    const addedAdmins = logMessageData.addedParticipants || [];
    const removedAdmins = logMessageData.removedParticipants || [];

    for(let admin of addedAdmins) {
      const adminName = await Users.getNameUser(admin.userFbId);
      api.sendMessage(`👑━━━━━━━━━━━━━━━━👑\n✨ 𝐀𝐃𝐌𝐈𝐍 𝐔𝐏𝐃𝐀𝐓𝐄 ✨\n👑━━━━━━━━━━━━━━━━👑\n\n💠 ${adminName} 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐚𝐝𝐝𝐞𝐝 𝐚𝐬 𝐚𝐧 𝐚𝐝𝐦𝐢𝐧 ✅\n\n👑━━━━━━━━━━━━━━━━👑`, threadID);
    }

    for(let admin of removedAdmins) {
      const adminName = await Users.getNameUser(admin.userFbId);
      api.sendMessage(`❌━━━━━━━━━━━━━━━━❌\n✨ 𝐀𝐃𝐌𝐈𝐍 𝐑𝐄𝐌𝐎𝐕𝐄 ✨\n❌━━━━━━━━━━━━━━━━❌\n\n💠 ${adminName} 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐫𝐞𝐦𝐨𝐯𝐞𝐝 𝐟𝐫𝐨𝐦 𝐚𝐝𝐦𝐢𝐧 💔\n\n❌━━━━━━━━━━━━━━━━❌`, threadID);
    }
  }

  // ✏️ Nickname Change
  if(event.logMessageType === "log:user-nickname") {
    const userID = logMessageData.participantID;
    const oldName = logMessageData.nickname || "No Previous Nickname";
    const newName = logMessageData.newNickname || "None";
    const userName = await Users.getNameUser(userID);

    api.sendMessage(`✏️━━━━━━━━━━━━━━━━✏️\n✨ 𝐍𝐈𝐂𝐊𝐍𝐀𝐌𝐄 𝐂𝐇𝐀𝐍𝐆𝐄 ✨\n✏️━━━━━━━━━━━━━━━━✏️\n\n👤 ${userName} 𝐡𝐚𝐬 𝐜𝐡𝐚𝐧𝐠𝐞𝐝 𝐭𝐡𝐞𝐢𝐫 𝐧𝐢𝐜𝐤𝐧𝐚𝐦𝐞\n💠 𝐎𝐥𝐝: ${oldName}\n💠 𝐍𝐞𝐰: ${newName}\n\n✏️━━━━━━━━━━━━━━━━✏️`, threadID);
  }

  // 🔔 Thread Name Change
  if(event.logMessageType === "log:thread-name") {
    const newThreadName = logMessageData.name || "No Name";
    api.sendMessage(`📝━━━━━━━━━━━━━━━━📝\n✨ 𝐓𝐇𝐑𝐄𝐀𝐃 𝐍𝐀𝐌𝐄 𝐂𝐇𝐀𝐍𝐆𝐄 ✨\n📝━━━━━━━━━━━━━━━━📝\n\n💠 𝐓𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 𝐧𝐚𝐦𝐞 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐜𝐡𝐚𝐧𝐠𝐞𝐝 𝐭𝐨: ${newThreadName}\n\n📝━━━━━━━━━━━━━━━━📝`, threadID);
  }
};
