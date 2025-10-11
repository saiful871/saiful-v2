const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const Canvas = require("canvas");

module.exports.config = {
  name: "leavenoti",
  version: "1.0.2",
  credits: "Saiful Islam (Based on joinnoti)",
  description: "Send a goodbye message with profile pic, group info, adder & Bangla farewell rules when someone leaves",
  eventType: ["log:unsubscribe"],
  dependencies: {
    "canvas": "",
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID, logMessageData } = event;
  const left = logMessageData.leftParticipant?.[0];
  if (!left) return;

  const userID = left.userFbId;
  const userName = left.fullName;

  const threadInfo = await api.getThreadInfo(threadID);
  const groupName = threadInfo.threadName;
  const memberCount = threadInfo.participantIDs.length;

  // Who added them originally
  const adderID = left.author || null;
  let adderName = "Unknown";
  if (adderID) {
    adderName = (await Users.getNameUser(adderID)) || "Unknown";
  }

  // Leave time
  const timeString = new Date().toLocaleString("en-US", { 
    weekday: "long", 
    hour: "2-digit", 
    minute: "2-digit", 
    hour12: true 
  });

  // Background & avatar setup
  const bgURL = "https://i.postimg.cc/rmkVVbsM/r07qxo-R-Download.jpg";
  const avatarURL = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

  const cacheDir = path.join(__dirname, "cache");
  fs.ensureDirSync(cacheDir);

  const bgPath = path.join(cacheDir, "leave_bg.jpg");
  const avatarPath = path.join(cacheDir, `avt_${userID}.png`);
  const outPath = path.join(cacheDir, `leave_${userID}.png`);

  try {
    // Download background and avatar
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

    // Avatar frame
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 8, 0, Math.PI * 2, false);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    const avatar = await Canvas.loadImage(avatarPath);
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // Text designs
    ctx.textAlign = "center";

    // Name
    ctx.font = "bold 36px Arial";
    ctx.fillStyle = "#FF6347";
    ctx.fillText(userName, canvas.width / 2, avatarY + avatarSize + 50);

    // Group name
    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "#00FFFF";
    ctx.fillText(groupName, canvas.width / 2, avatarY + avatarSize + 90);

    // Member number
    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#FFFF00";
    ctx.fillText(`Now ${memberCount} members remain 👋`, canvas.width / 2, avatarY + avatarSize + 130);

    // Owner credit
    ctx.font = "bold 22px Arial";
    ctx.fillStyle = "#FF69B4";
    ctx.fillText(`Bot Owner: Saiful Islam 💻`, canvas.width / 2, canvas.height - 30);

    // Save image
    const finalBuffer = canvas.toBuffer();
    fs.writeFileSync(outPath, finalBuffer);

    // Bangla farewell rules
    const leaveRules = 
`📜 𝗙𝗔𝗥𝗘𝗪𝗘𝗟𝗟 𝗥𝗨𝗟𝗘𝗦 (বিদায়ের নিয়ম) 📜
১️⃣ সদ্য বিদায়ী সদস্যকে শুভকামনা জানানো উচিত 👋
২️⃣ কোনো আক্রমণাত্মক বা অশালীন মন্তব্য করা যাবে না ❌
৩️⃣ গ্রুপে শান্তিপূর্ণ পরিবেশ বজায় রাখা সকলের দায়িত্ব 🌿
৪️⃣ বিদায় নেওয়ার পরে ব্যক্তিগত আক্রমণ বা মন্তব্য করা যাবে না ⚠️
৫️⃣ আমরা আশা করি আপনি আবার আমাদের সাথে যোগ দেবেন 💌`;

    // Message send
    const leaveMessage = {
      body: `━━━━━━━━━━━━━━━━━━\n` +
            `😢 GOODBYE FROM THE GROUP 😢\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `🚀 Name : @${userName}\n` +
            `🏷️ Group : ${groupName}\n` +
            `🔢 Remaining Members : ${memberCount}\n` +
            `⏰ Time : ${timeString}\n` +
            `👤 Added by : @${adderName}\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `${leaveRules}\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `👑 Bot Owner : Saiful Islam 💻`,
      mentions: [
        { tag: `@${userName}`, id: userID },
        ...(adderID ? [{ tag: `@${adderName}`, id: adderID }] : [])
      ],
      attachment: fs.createReadStream(outPath)
    };

    api.sendMessage(leaveMessage, threadID, () => {
      fs.unlinkSync(bgPath);
      fs.unlinkSync(avatarPath);
      fs.unlinkSync(outPath);
    });

  } catch (error) {
    console.error("Leavenoti error:", error);
    api.sendMessage("⚙️ Leave module error — check console ⚙️", threadID);
  }
};
