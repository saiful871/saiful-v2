const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");

registerFont(path.join(__dirname, "NotoSansBengali-Regular.ttf"), { family: "Bangla" });

module.exports.config = {
  name: "fm",
  version: "4.0",
  hasPermssion: 0,
  credits: "Helal + Cyber Sujon + Final Fix by GPT-5",
  description: "Show group collage with full admin name list (Bangla-English mixed)",
  commandCategory: "Group",
  usages: ".fm",
  cooldowns: 10
};

module.exports.run = async function ({ api, event }) {
  try {
    const info = await api.getThreadInfo(event.threadID);
    if (!info || !info.participantIDs)
      return api.sendMessage("⚠️ গ্রুপের তথ্য আনা যায়নি।", event.threadID);

    const members = info.participantIDs || [];
    const admins = info.adminIDs?.map(a => a.id) || [];
    const groupName = info.threadName || "Unnamed Group";
    const groupImage = info.imageSrc || null;

    if (members.length === 0)
      return api.sendMessage("⚠️ কোনো সদস্য পাওয়া যায়নি।", event.threadID);

    api.sendMessage(`🎨 ${groupName} গ্রুপের ${members.length} সদস্যের ছবি তৈরি হচ্ছে...`, event.threadID);

    const width = 1920, height = 1080;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#141414";
    ctx.fillRect(0, 0, width, height);

    // Group profile
    if (groupImage) {
      try {
        const imgRes = await axios.get(groupImage, { responseType: "arraybuffer" });
        const groupPic = await loadImage(Buffer.from(imgRes.data, "binary"));
        const size = 200;
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, 120, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(groupPic, width / 2 - size / 2, 20, size, size);
        ctx.restore();
      } catch {}
    }

    // Group name
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 70px Bangla";
    ctx.fillText(groupName, width / 2, 300);
    ctx.font = "bold 38px Sans-serif";
    ctx.fillText(`👑 Admins: ${admins.length} | 👥 Members: ${members.length}`, width / 2, 360);

    // Draw member pictures
    const radius = 55;
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
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x - radius, y - radius, radius * 2, radius * 2);
        ctx.restore();

        ctx.lineWidth = 4;
        ctx.strokeStyle = admins.includes(id) ? "#FFD700" : "#00BFFF";
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();

        x += radius * 2 + margin;
        if (x + radius > width) {
          x = radius + margin;
          y += radius * 2 + margin;
        }
      } catch {}
    }

    // Fetch admin names
    let adminNames = [];
    for (const id of admins) {
      try {
        const info = await api.getUserInfo(id);
        const name = info[id]?.name || "Unknown";
        adminNames.push(name);
      } catch {
        adminNames.push("Unknown");
      }
    }

    // বাংলা-ইংরেজি detect
    const allNamesText = adminNames.join(", ");
    ctx.font = "30px Bangla";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    const lines = wrapText(ctx, allNamesText, width - 100);
    let yText = height - (lines.length * 35) - 30;
    ctx.font = "bold 34px Bangla";
    ctx.fillText("👑 অ্যাডমিন তালিকা", width / 2, yText - 40);
    ctx.font = "30px Bangla";
    for (const line of lines) {
      ctx.fillText(line, width / 2, yText);
      yText += 35;
    }

    // Save file
    const out = path.join(__dirname, "fm_final.jpg");
    fs.writeFileSync(out, canvas.toBuffer("image/jpeg"));

    // First message (photo)
    await api.sendMessage(
      {
        body: `🌺 ${groupName}\n👥 মোট সদস্য: ${members.length}\n👑 অ্যাডমিন সংখ্যা: ${admins.length}`,
        attachment: fs.createReadStream(out)
      },
      event.threadID
    );

    // Second message (full admin list)
    const adminListText = `👑 গ্রুপের সব অ্যাডমিন (${admins.length} জন):\n\n${adminNames.join("\n")}`;
    await api.sendMessage(adminListText, event.threadID);

    fs.unlinkSync(out);
  } catch (e) {
    console.error(e);
    api.sendMessage("❌ কোলাজ তৈরি করতে সমস্যা হয়েছে।", event.threadID);
  }
};

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
    } else line = test;
  }
  lines.push(line.trim());
  return lines;
                }
