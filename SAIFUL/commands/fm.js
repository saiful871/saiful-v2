const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Canvas = require("canvas");

module.exports.config = {
  name: "fm",
  version: "5.0",
  hasPermssion: 0,
  credits: "Helal + Cyber Sujon + Fix & Upgrade by GPT-5",
  description: "Show full group collage with cover group photo and admin list",
  commandCategory: "Group",
  usages: ".fm",
  cooldowns: 10
};

module.exports.run = async function ({ api, event }) {
  try {
    const info = await api.getThreadInfo(event.threadID);
    const groupName = info.threadName || "Unnamed Group";
    const members = info.participantIDs || [];
    const admins = info.adminIDs?.map(a => a.id) || [];
    const groupID = event.threadID;

    api.sendMessage(`🎨 ${groupName} গ্রুপের তথ্য সংগ্রহ হচ্ছে...`, event.threadID);

    // Fetch group profile photo
    const groupPicUrl = `https://graph.facebook.com/${groupID}/picture?width=500&height=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    const width = 1920, height = 1080;
    const canvas = Canvas.createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#141E30");
    gradient.addColorStop(1, "#243B55");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // --- Group profile photo top ---
    try {
      const groupPicData = await axios.get(groupPicUrl, { responseType: "arraybuffer" });
      const groupPic = await Canvas.loadImage(Buffer.from(groupPicData.data, "binary"));
      const picSize = 200;
      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 2, 150, picSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(groupPic, width / 2 - picSize / 2, 100 - picSize / 4, picSize, picSize);
      ctx.restore();

      // Circle border
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#FFD700";
      ctx.beginPath();
      ctx.arc(width / 2, 150, picSize / 2 + 3, 0, Math.PI * 2);
      ctx.stroke();
    } catch (e) {
      console.log("⚠️ Group photo load failed:", e.message);
    }

    // --- Group name & info ---
    ctx.font = "bold 70px Sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.fillText(groupName, width / 2, 320);

    ctx.font = "40px Sans-serif";
    ctx.fillStyle = "#FFD700";
    ctx.fillText(`👥 সদস্য: ${members.length} | 👑 অ্যাডমিন: ${admins.length}`, width / 2, 380);

    // --- Fetch admin names ---
    let adminNames = [];
    for (const id of admins) {
      try {
        const user = await api.getUserInfo(id);
        const name = user[id]?.name || "Unknown";
        adminNames.push(name);
      } catch {
        adminNames.push("Unknown");
      }
    }

    // --- Draw member profile circles ---
    const radius = 40;
    const margin = 15;
    const startY = 450;
    const perRow = Math.floor(width / (radius * 2 + margin));
    let x = radius + margin, y = startY;

    for (let i = 0; i < members.length; i++) {
      const id = members[i];
      try {
        const imgURL = `https://graph.facebook.com/${id}/picture?width=200&height=200&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const imgData = await axios.get(imgURL, { responseType: "arraybuffer" });
        const img = await Canvas.loadImage(Buffer.from(imgData.data, "binary"));
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x - radius, y - radius, radius * 2, radius * 2);
        ctx.restore();

        // Gold border for admins
        if (admins.includes(id)) {
          ctx.lineWidth = 3;
          ctx.strokeStyle = "#FFD700";
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.stroke();
        }

        x += radius * 2 + margin;
        if (x + radius > width) {
          x = radius + margin;
          y += radius * 2 + margin;
        }
      } catch (err) {
        console.log("⚠️ Member image load failed:", err.message);
      }
    }

    // --- Admin section bottom ---
    ctx.font = "bold 40px Sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(`👑 গ্রুপ অ্যাডমিন (${adminNames.length})`, width / 2, height - 160);

    ctx.font = "30px Sans-serif";
    const allAdmins = adminNames.join(", ");
    const lines = wrapText(ctx, allAdmins, width - 150);
    let textY = height - 120;
    for (const line of lines) {
      ctx.fillText(line, width / 2, textY);
      textY += 38;
    }

    // --- Save and send ---
    const outPath = path.join(__dirname, "fm_group_collage.jpg");
    fs.writeFileSync(outPath, canvas.toBuffer("image/jpeg"));

    await api.sendMessage(
      {
        body: `🌸 ${groupName}\n👥 মোট সদস্য: ${members.length}\n👑 অ্যাডমিন (${adminNames.length}): ${adminNames.join(", ")}`,
        attachment: fs.createReadStream(outPath)
      },
      event.threadID
    );

    fs.unlinkSync(outPath);
  } catch (e) {
    console.log(e);
    api.sendMessage("❌ কোলাজ তৈরি করার সময় ত্রুটি ঘটেছে!", event.threadID);
  }
};

// Helper: Text wrapping
function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      lines.push(line.trim());
      line = words[i] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());
  return lines;
  }
