const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "fm",
  version: "3.5",
  hasPermssion: 0,
  credits: "Helal + Cyber Sujon + GPT-5 (Group DP Added)",
  description: "Fullscreen collage with group profile, admin names & member photos",
  commandCategory: "Group",
  usages: ".fm",
  cooldowns: 10
};

module.exports.run = async function ({ api, event }) {
  try {
    const info = await api.getThreadInfo(event.threadID);
    if (!info || !info.participantIDs) {
      return api.sendMessage("⚠️ Couldn't get group info.", event.threadID);
    }

    const members = info.participantIDs || [];
    const admins = info.adminIDs?.map(a => a.id) || [];
    const groupName = info.threadName || "Unnamed Group";
    const groupImage = info.imageSrc || null;

    if (members.length === 0)
      return api.sendMessage("⚠️ No members found.", event.threadID);

    api.sendMessage(`🎨 তৈরি হচ্ছে ${members.length} সদস্যের ফুলস্ক্রিন কোলাজ...`, event.threadID);

    const width = 1920, height = 1080;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Background color
    ctx.fillStyle = "#5a2a2a";
    ctx.fillRect(0, 0, width, height);

    // Draw group profile picture (if available)
    if (groupImage) {
      try {
        const imgRes = await axios.get(groupImage, { responseType: "arraybuffer" });
        const groupPic = await loadImage(Buffer.from(imgRes.data, "binary"));

        const logoSize = 200;
        const logoX = width / 2 - logoSize / 2;
        const logoY = 50;

        // Glow effect
        ctx.save();
        ctx.shadowColor = "#00ffcc";
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(width / 2, logoY + logoSize / 2, logoSize / 2 + 5, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(groupPic, logoX, logoY, logoSize, logoSize);
        ctx.restore();
      } catch (err) {
        console.log("⚠️ Couldn't load group photo:", err.message);
      }
    }

    // Title & info
    ctx.font = "bold 70px Sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(groupName, width / 2, 300);

    ctx.font = "bold 40px Sans-serif";
    ctx.fillText(`Admins: ${admins.length}   |   Members: ${members.length}`, width / 2, 360);

    // Arrange members' profile pictures
    const radius = 60;
    const margin = 25;
    const perRow = Math.floor(width / (radius * 2 + margin));
    let x = radius + margin;
    let y = 420;

    for (let i = 0; i < members.length; i++) {
      const id = members[i];
      try {
        const url = `https://graph.facebook.com/${id}/picture?width=200&height=200&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const res = await axios.get(url, { responseType: "arraybuffer" });
        const img = await loadImage(Buffer.from(res.data, "binary"));

        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x - radius, y - radius, radius * 2, radius * 2);
        ctx.restore();

        // Border color
        ctx.lineWidth = 4;
        ctx.strokeStyle = admins.includes(id) ? "#FFD700" : "#00FFFF"; // Gold for admin, cyan for member
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2, true);
        ctx.stroke();

        x += radius * 2 + margin;
        if (x + radius > width) {
          x = radius + margin;
          y += radius * 2 + margin;
        }
      } catch (err) {
        console.log("⚠️ Error fetching user:", id, err.message);
      }
    }

    // Fetch admin names
    const adminInfos = await api.getUserInfo(admins);
    const adminNames = Object.values(adminInfos).map(u => u.name);
    const namesText = `👑 অ্যাডমিন: ${adminNames.join(", ")}`;

    // Draw admin names below
    ctx.font = "30px Sans-serif";
    ctx.fillStyle = "#fff";
    const lines = wrapText(ctx, namesText, width - 100);
    let textY = height - (lines.length * 35);
    for (const line of lines) {
      ctx.fillText(line, width / 2, textY);
      textY += 35;
    }

    // Save and send image
    const out = path.join(__dirname, "fm_fullscreen.jpg");
    fs.writeFileSync(out, canvas.toBuffer("image/jpeg"));

    await api.sendMessage(
      {
        body: `🌺 ${groupName}\n👑 অ্যাডমিন (${admins.length}): ${adminNames.join(", ")}\n👥 মোট সদস্য: ${members.length}`,
        attachment: fs.createReadStream(out)
      },
      event.threadID
    );

    fs.unlinkSync(out);
  } catch (err) {
    console.error(err);
    api.sendMessage("❌ Error creating collage.", event.threadID);
  }
};

// Word wrap helper
function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (let word of words) {
    const test = line + word + " ";
    const { width } = ctx.measureText(test);
    if (width > maxWidth && line.length > 0) {
      lines.push(line.trim());
      line = word + " ";
    } else {
      line = test;
    }
  }
  lines.push(line.trim());
  return lines;
    }
