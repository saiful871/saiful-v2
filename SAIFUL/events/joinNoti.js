const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const Canvas = require("canvas");

module.exports.config = {
  name: "joinnoti",
  version: "1.0.2",
  credits: "Maria (rX Modded) + Updated by rX Abdullah",
  description: "Welcome new member with profile pic and group info",
  eventType: ["log:subscribe"],
  dependencies: {
    "canvas": "",
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID, logMessageData } = event;
  const added = logMessageData.addedParticipants?.[0];
  if (!added) return;

  const userID = added.userFbId;
  const userName = added.fullName;

  const threadInfo = await api.getThreadInfo(threadID);
  const groupName = threadInfo.threadName;
  const memberCount = threadInfo.participantIDs.length;

  // Who added them
  const adderID = event.author;
  const adderName = (await Users.getNameUser(adderID)) || "Unknown";

  // Join time
  const timeString = new Date().toLocaleString("en-US", { 
    weekday: "long", 
    hour: "2-digit", 
    minute: "2-digit", 
    hour12: true 
  });

  const bgURL = "https://i.postimg.cc/rmkVVbsM/r07qxo-R-Download.jpg";
  const avatarURL = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

  const cacheDir = path.join(__dirname, "cache");
  fs.ensureDirSync(cacheDir);

  const bgPath = path.join(cacheDir, "bg.jpg");
  const avatarPath = path.join(cacheDir, `avt_${userID}.png`);
  const outPath = path.join(cacheDir, `welcome_${userID}.png`);

  try {
    // Download background
    const bgImg = (await axios.get(bgURL, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(bgPath, Buffer.from(bgImg));

    // Download avatar
    const avatarImg = (await axios.get(avatarURL, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(avatarPath, Buffer.from(avatarImg));

    // Create canvas
    const canvas = Canvas.createCanvas(800, 500);
    const ctx = canvas.getContext("2d");

    const background = await Canvas.loadImage(bgPath);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const avatarSize = 180;
    const avatarX = (canvas.width - avatarSize) / 2;
    const avatarY = 100;

    // White circular frame
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 8, 0, Math.PI * 2, false);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Load avatar
    const avatar = await Canvas.loadImage(avatarPath);
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // Draw text lines with different colors
    ctx.textAlign = "center";

    // 1️⃣ Member Name
    ctx.font = "bold 36px Arial";
    ctx.fillStyle = "#FFB6C1"; // pink
    ctx.fillText(userName, canvas.width / 2, avatarY + avatarSize + 50);

    // 2️⃣ Group Name
    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "#00FFFF"; // cyan
    ctx.fillText(groupName, canvas.width / 2, avatarY + avatarSize + 90);

    // 3️⃣ Member count
    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#FFFF00"; // yellow
    ctx.fillText(`You are the ${memberCount}th member of this group`, canvas.width / 2, avatarY + avatarSize + 130);

    // Save final image
    const finalBuffer = canvas.toBuffer();
    fs.writeFileSync(outPath, finalBuffer);

    // Custom welcome message
    const message = {
      body: `[ 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 🎉 ]\n` +
            `・𝗡𝗮𝗺𝗲     : @${userName}\n` +
            `・𝗚𝗿𝗼𝘂𝗽     : ${groupName}\n` +
            `・𝗧𝗶𝗺𝗲     : ${timeString}\n` +
            `・𝗔𝗱𝗱𝗲𝗱 𝗕𝘆 : @${adderName}\n` +
            `___________________________\n` +
            `___________________________`,
      mentions: [
        { tag: `@${userName}`, id: userID },
        { tag: `@${adderName}`, id: adderID }
      ],
      attachment: fs.createReadStream(outPath)
    };

    api.sendMessage(message, threadID, () => {
      fs.unlinkSync(bgPath);
      fs.unlinkSync(avatarPath);
      fs.unlinkSync(outPath);
    });

  } catch (error) {
    console.error("Joinnoti error:", error);
    api.sendMessage("𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐲𝐩𝐞 !𝐡𝐞𝐥𝐩 𝐟𝐨𝐫 𝐚𝐥𝐥 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬 ⚙️", threadID);
  }
};
