const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const Canvas = require("canvas");

module.exports.config = {
  name: "antiout",
  version: "1.1.0",
  credits: "Saiful Islam (with caption system)",
  description: "Auto add member back if they leave the group (Anti Out with caption)",
  eventType: ["log:unsubscribe"],
  dependencies: {
    "canvas": "",
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID, logMessageData } = event;
  const leftUser = logMessageData.leftParticipantFbId;

  if (!leftUser) return;

  const threadInfo = await api.getThreadInfo(threadID);
  const groupName = threadInfo.threadName;
  const memberCount = threadInfo.participantIDs.length;
  const userName = (await Users.getNameUser(leftUser)) || "Unknown User";

  try {
    // 🛑 Try to add back user
    await api.addUserToGroup(leftUser, threadID);

    // 🖼️ Background & Avatar
    const bgURL = "https://i.postimg.cc/rmkVVbsM/r07qxo-R-Download.jpg";
    const avatarURL = `https://graph.facebook.com/${leftUser}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    const cacheDir = path.join(__dirname, "cache");
    fs.ensureDirSync(cacheDir);

    const bgPath = path.join(cacheDir, "bg.jpg");
    const avatarPath = path.join(cacheDir, `avt_${leftUser}.png`);
    const outPath = path.join(cacheDir, `antiout_${leftUser}.png`);

    // 🔽 Download images
    const bgImg = (await axios.get(bgURL, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(bgPath, Buffer.from(bgImg));
    const avatarImg = (await axios.get(avatarURL, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(avatarPath, Buffer.from(avatarImg));

    // 🎨 Canvas setup
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

    // 📝 Text design
    ctx.textAlign = "center";

    ctx.font = "bold 36px Arial";
    ctx.fillStyle = "#FF4500";
    ctx.fillText("😎 অ্যান্টি-আউট অ্যাকটিভ 😎", canvas.width / 2, 70);

    ctx.font = "bold 34px Arial";
    ctx.fillStyle = "#00FFFF";
    ctx.fillText(userName, canvas.width / 2, avatarY + avatarSize + 50);

    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#FFFF00";
    ctx.fillText(`তুমি পালাতে চেয়েছিলে, কিন্তু ${groupName} ছাড়তে পারবে না 😜`, canvas.width / 2, avatarY + avatarSize + 100);

    // 📸 Caption (বাংলা ফানি মেসেজ)
    const caption = "😂 পালিয়ে লাভ নাই ভাই! আবার ফিরাই আনছি তোমারে 😈";

    ctx.font = "bold 24px Arial";
    ctx.fillStyle = "#FF69B4";
    ctx.fillText(caption, canvas.width / 2, canvas.height - 60);

    ctx.font = "bold 22px Arial";
    ctx.fillStyle = "#00FF7F";
    ctx.fillText(`👑 Bot Owner: Saiful Islam 💻`, canvas.width / 2, canvas.height - 25);

    const buffer = canvas.toBuffer();
    fs.writeFileSync(outPath, buffer);

    // 💬 Message
    const message = {
      body:
        `🚨 @${userName} পালিয়ে গিয়েছিল!\n` +
        `কিন্তু AntiOut তাকে আবার টেনে আনলো 😈\n\n` +
        `🏷️ Group: ${groupName}\n` +
        `🔢 Member count: ${memberCount}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `😂 ক্যাপশন: "${caption}"\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `👑 Bot Owner: Saiful Islam 💻`,
      mentions: [{ tag: `@${userName}`, id: leftUser }],
      attachment: fs.createReadStream(outPath)
    };

    api.sendMessage(message, threadID, () => {
      fs.unlinkSync(bgPath);
      fs.unlinkSync(avatarPath);
      fs.unlinkSync(outPath);
    });

  } catch (error) {
    console.error("AntiOut Error:", error);
    api.sendMessage("⚙️ AntiOut failed — check console ⚙️", threadID);
  }
};
