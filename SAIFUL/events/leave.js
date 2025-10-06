module.exports.config = {
  name: "leave",
  eventType: ["log:unsubscribe"],
  version: "1.2.0",
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
  description: "গ্রুপ থেকে কেউ বের হলে প্রিমিয়াম কার্ড স্টাইল নোটিফিকেশন দেখাবে",
  dependencies: {
    "fs-extra": "",
    "path": ""
  }
};

module.exports.run = async function({ api, event, Users, Threads }) {
  if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

  const { createReadStream, existsSync, mkdirSync } = global.nodemodule["fs-extra"];
  const { join } = global.nodemodule["path"];
  const { threadID } = event;

  const data = global.data.threadData.get(parseInt(threadID)) || (await Threads.getData(threadID)).data;
  const name = global.data.userName.get(event.logMessageData.leftParticipantFbId) || await Users.getNameUser(event.logMessageData.leftParticipantFbId);

  // কার্ড স্টাইল ক্যাপশন
  const type = (event.author == event.logMessageData.leftParticipantFbId)
    ? `🌑 ──────[⚡ 𝙎𝙀𝙇𝙁 𝙇𝙀𝘼𝙑𝙀 ⚡]────── 🌑\n\n💥 𝙃𝙚𝙮 ${name}!\nতুই পারমিশন ছাড়া লিভ করেছোস 😎\n✨ তোকে আবার গ্রুপে এড করা হলো, প্রিমিয়াম স্টাইল!`
    : `🛑 ──────[🚫 𝐀𝐃𝐌𝐈𝐍 𝐀𝐂𝐓𝐈𝐎𝐍 🚫]───── 🛑\n\n${name}, এই গ্রুপে থাকার যোগ্যতা নেই 😏\n🔥 তাই তোমাকে লিফট করা হলো। নিয়ম হলো নিয়মেই!`;

  // GIF path
  const path = join(__dirname, "leaveGif");
  const gifPath = join(path, `leave1.gif`);

  if (!existsSync(path)) mkdirSync(path, { recursive: true });

  let msg = (typeof data.customLeave == "undefined")
    ? "{type}"
    : data.customLeave;

  msg = msg.replace(/\{name}/g, name).replace(/\{type}/g, type);

  const formPush = existsSync(gifPath)
    ? { body: msg, attachment: createReadStream(gifPath) }
    : { body: msg };

  return api.sendMessage(formPush, threadID);
};
