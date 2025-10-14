const fs = global.nodemodule["fs-extra"];
const path = global.nodemodule["path"];
const axios = global.nodemodule["axios"];
const Canvas = global.nodemodule["canvas"];

module.exports.config = {
  name: "leavenoti",
  version: "2.1.0",
  credits: "Saiful Islam (Hybrid Edition)",
  description: "Send goodbye message with image & Bangla farewell rules when someone leaves the group",
  eventType: ["log:unsubscribe"],
  dependencies: {
    "canvas": "",
    "axios": "",
    "fs-extra": "",
    "path": ""
  }
};

module.exports.run = async function({ api, event, Users, Threads }) {
  const { threadID } = event;
  const leftID = event.logMessageData.leftParticipantFbId;

  if (!leftID) return;
  if (leftID == api.getCurrentUserID()) return; // bot left

  // Thread info
  const threadInfo = await api.getThreadInfo(threadID);
  const userName = global.data.userName.get(leftID) || await Users.getNameUser(leftID);
  const memberCount = threadInfo.participantIDs.length;
  const groupName = threadInfo.threadName;

  // Thread stored data (for custom messages)
  const data = global.data.threadData.get(parseInt(threadID)) || (await Threads.getData(threadID)).data;

  // =========================
  // ====== UPDATED TEXT =====
  // =========================
  // If the user themself left -> voluntary message
  // If they were removed (author != leftID) -> polite removed message (changed per request)
  let type;
  if (event.author == leftID) {
    // voluntary leave
    type = "😢 স্বেচ্ছায় গ্রুপ ত্যাগ করেছে!";
  } else {
    // removed by admin — updated caption (polite & clear)
    type = "⚠️ তাকে গ্রুপ থেকে রিমুভ (remove) করা হয়েছে। প্রয়োজনে অ্যাডমিনের সাথে যোগাযোগ করুন।";
  }

  // Optional custom leave text (if exists)
  let msg = (typeof data.customLeave == "undefined")
    ? "{name} {type}"
    : data.customLeave;

  msg = msg.replace(/\{name}/g, userName).replace(/\{type}/g, type);

  // Image generation variables
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

    // Canvas setup
    const canvas = Canvas.createCanvas(800, 500);
    const ctx = canvas.getContext("2d");
    const background = await Canvas.loadImage(bgPath);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const avatarSize = 180;
    const avatarX = (canvas.width - avatarSize) / 2;
    const avatarY = 100;

    // Avatar white frame
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

    // Bangla farewell message (rules)
    const leaveRules =
`📜 বিদায়ের নিয়মাবলী 📜
১️⃣ সদ্য বিদায়ী সদস্যকে শুভকামনা জানানো উচিত 👋
২️⃣ কোনো আক্রমণাত্মক বা অশালীন মন্তব্য করা যাবে না ❌
৩️⃣ গ্রুপে শান্তিপূর্ণ পরিবেশ বজায় রাখা সকলের দায়িত্ব 🌿
৪️⃣ বিদায় নেওয়ার পরে ব্যক্তিগত আক্রমণ বা মন্তব্য করা যাবে না ⚠️
৫️⃣ আমরা আশা করি আপনি আবার আমাদের সাথে যোগ দেবেন 💌`;

    // Final message body
    const finalMsg = {
      body:
`━━━━━━━━━━━━━━━━━━
😢 𝐅𝐀𝐑𝐄𝐖𝐄𝐋𝐋 𝐍𝐎𝐓𝐈𝐂𝐄 😢
━━━━━━━━━━━━━━━━━━
🚀 নাম : ${userName}
🏷️ গ্রুপ : ${groupName}
🔢 সদস্য সংখ্যা : ${memberCount}
💬 অবস্থা : ${type}
━━━━━━━━━━━━━━━━━━
${leaveRules}
━━━━━━━━━━━━━━━━━━
👑 Bot Owner : Saiful Islam 💻
━━━━━━━━━━━━━━━━━━
${msg}`,
      attachment: fs.createReadStream(outPath)
    };

    api.sendMessage(finalMsg, threadID, () => {
      // cleanup
      try {
        fs.unlinkSync(bgPath);
        fs.unlinkSync(avatarPath);
        fs.unlinkSync(outPath);
      } catch (e) { /* ignore cleanup errors */ }
    });

  } catch (err) {
    console.error("LeaveNoti Error:", err);
    api.sendMessage("⚙️ লিভ নোটিফাই মডিউলে সমস্যা হয়েছে ⚙️", threadID);
  }
};
