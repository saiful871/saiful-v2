const fs = global.nodemodule["fs-extra"];
const path = global.nodemodule["path"];
const axios = global.nodemodule["axios"];
const Canvas = global.nodemodule["canvas"];

module.exports.config = {
  name: "leavenoti",
  version: "3.0.0",
  credits: "Saiful Islam (Hybrid Edition Final)",
  description: "Send different farewell messages when someone leaves or gets removed from the group",
  eventType: ["log:unsubscribe"],
  dependencies: {
    "canvas": "",
    "axios": "",
    "fs-extra": "",
    "path": ""
  }
};

module.exports.run = async function ({ api, event, Users, Threads }) {
  const { threadID } = event;
  const leftID = event.logMessageData.leftParticipantFbId;

  if (!leftID) return;
  if (leftID == api.getCurrentUserID()) return; // if bot left

  // Thread info
  const threadInfo = await api.getThreadInfo(threadID);
  const userName = global.data.userName.get(leftID) || await Users.getNameUser(leftID);
  const memberCount = threadInfo.participantIDs.length;
  const groupName = threadInfo.threadName;

  // Get thread data
  const data = global.data.threadData.get(parseInt(threadID)) || (await Threads.getData(threadID)).data;

  // =========================
  // ====== TEXT SYSTEM ======
  // =========================
  let type, caption;

  if (event.author == leftID) {
    // === Member left by themselves ===
    type = "😢 স্বেচ্ছায় গ্রুপ ত্যাগ করেছে!";
    caption = 
`━━━━━━━━━━━━━━━━━━
💬 𝐕𝐎𝐋𝐔𝐍𝐓𝐀𝐑𝐘 𝐋𝐄𝐀𝐕𝐄 💬
━━━━━━━━━━━━━━━━━━
👤 নাম : ${userName}
🏷️ গ্রুপ : ${groupName}
👥 সদস্য সংখ্যা : ${memberCount}
📤 অবস্থা : তিনি নিজের ইচ্ছায় গ্রুপ ত্যাগ করেছেন 😔
━━━━━━━━━━━━━━━━━━
🌸 কখনও কখনও চুপচাপ বিদায়ই সবচেয়ে শান্ত সমাধান 🌸  
তোমার জন্য রইল আমাদের আন্তরিক শুভকামনা 💐  
আশা করি একদিন আবার ফিরে আসবে 💌
━━━━━━━━━━━━━━━━━━
📜 গ্রুপের নিয়মাবলী 📜  
1️⃣ সদ্য বিদায়ী সদস্যকে শুভকামনা জানানো উচিত 👋  
2️⃣ কেউ যেন আক্রমণাত্মক মন্তব্য না করে ❌  
3️⃣ সবাই মিলে গ্রুপে শান্তি বজায় রাখুন 🌿  
━━━━━━━━━━━━━━━━━━
╔═❖═❖═❖═❖═❖═❖═╗
 👑 𝐁𝐨𝐭 𝐎𝐰𝐧𝐞𝐫: 𝐒𝐚𝐢𝐟𝐮𝐥 𝐈𝐬𝐥𝐚𝐦  
╚═❖═❖═❖═❖═❖═❖═╝
`;
  } 
  else {
    // === Removed by Admin ===
    type = "⚠️ অ্যাডমিন কর্তৃক গ্রুপ থেকে রিমুভ করা হয়েছে!";
    caption = 
`━━━━━━━━━━━━━━━━━━
💔 𝐑𝐄𝐌𝐎𝐕𝐄𝐃 𝐁𝐘 𝐀𝐃𝐌𝐈𝐍 💔
━━━━━━━━━━━━━━━━━━
👤 নাম : ${userName}
🏷️ গ্রুপ : ${groupName}
👥 সদস্য সংখ্যা : ${memberCount}
⚠️ অবস্থা : ${type}
━━━━━━━━━━━━━━━━━━
🌙 প্রতিটি বিদায়ের পেছনে থাকে একটুখানি গল্প...  
হয়তো ভুল বোঝাবুঝি, হয়তো প্রয়োজনের তাগিদ।  
তবুও আমরা তার জন্য শুভ কামনা জানাই 💫  
━━━━━━━━━━━━━━━━━━
📜 গ্রুপ আচরণবিধি 📜  
1️⃣ অ্যাডমিনের সিদ্ধান্তকে সম্মান করুন 🙏  
2️⃣ কোনো নেতিবাচক মন্তব্য থেকে বিরত থাকুন ❌  
3️⃣ বন্ধুত্বপূর্ণ পরিবেশ বজায় রাখুন 🌿  
4️⃣ সম্পর্ক শেষ নয়, শুধু বিরতি মাত্র 💌  
━━━━━━━━━━━━━━━━━━
╔═❖═❖═❖═❖═❖═❖═╗
 👑 𝐁𝐨𝐭 𝐎𝐰𝐧𝐞𝐫: 𝐒𝐚𝐢𝐟𝐮𝐥 𝐈𝐬𝐥𝐚𝐦  
╚═❖═❖═❖═❖═❖═❖═╝`;
  }

  // Custom message (if user set)
  let msg = (typeof data.customLeave == "undefined")
    ? "{name} {type}"
    : data.customLeave;
  msg = msg.replace(/\{name}/g, userName).replace(/\{type}/g, type);

  // =========================
  // ===== IMAGE SETUP =======
  // =========================
  const bgURL = "https://i.postimg.cc/rmkVVbsM/r07qxo-R-Download.jpg";
  const avatarURL = `https://graph.facebook.com/${leftID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

  const cacheDir = path.join(__dirname, "cache");
  fs.ensureDirSync(cacheDir);

  const bgPath = path.join(cacheDir, "leave_bg.jpg");
  const avatarPath = path.join(cacheDir, `avt_${leftID}.png`);
  const outPath = path.join(cacheDir, `leave_${leftID}.png`);

  try {
    // Download background & avatar
    const bgImg = (await axios.get(bgURL, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(bgPath, Buffer.from(bgImg));
    const avatarImg = (await axios.get(avatarURL, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(avatarPath, Buffer.from(avatarImg));

    // Canvas draw
    const canvas = Canvas.createCanvas(800, 500);
    const ctx = canvas.getContext("2d");
    const background = await Canvas.loadImage(bgPath);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const avatarSize = 180;
    const avatarX = (canvas.width - avatarSize) / 2;
    const avatarY = 100;

    // Avatar circle
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 8, 0, Math.PI * 2, false);
    ctx.fillStyle = "#fff";
    ctx.fill();

    const avatar = await Canvas.loadImage(avatarPath);
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // Text on image
    ctx.textAlign = "center";
    ctx.font = "bold 36px Arial";
    ctx.fillStyle = "#FF6347";
    ctx.fillText(userName, canvas.width / 2, avatarY + avatarSize + 50);

    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "#00FFFF";
    ctx.fillText(groupName, canvas.width / 2, avatarY + avatarSize + 90);

    ctx.font = "bold 26px Arial";
    ctx.fillStyle = "#FFFF00";
    ctx.fillText(`বর্তমানে সদস্য ${memberCount} জন 👋`, canvas.width / 2, avatarY + avatarSize + 130);

    ctx.font = "bold 20px Arial";
    ctx.fillStyle = "#FF69B4";
    ctx.fillText(`Bot Owner: Saiful Islam 💻`, canvas.width / 2, canvas.height - 30);

    fs.writeFileSync(outPath, canvas.toBuffer());

    // Send message
    api.sendMessage({
      body: caption,
      attachment: fs.createReadStream(outPath)
    }, threadID, () => {
      // cleanup cache
      try {
        fs.unlinkSync(bgPath);
        fs.unlinkSync(avatarPath);
        fs.unlinkSync(outPath);
      } catch (e) { }
    });

  } catch (err) {
    console.error("LeaveNoti Error:", err);
    api.sendMessage("⚙️ লিভ নোটিফাই মডিউলে সমস্যা হয়েছে ⚙️", threadID);
  }
};
