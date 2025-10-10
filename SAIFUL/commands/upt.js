const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "upt",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "Rx Abdullah",
  usePrefix: true,
  description: "Bot status image",
  commandCategory: "system",
  usages: "",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event }) {
  try {
    // Background photo (catch file)
    const bgPath = path.join(__dirname, "cache", "status_bg.png"); 
    const bgImage = await loadImage(bgPath);

    // Canvas create
    const canvas = createCanvas(bgImage.width, bgImage.height);
    const ctx = canvas.getContext("2d");

    // Background draw
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    // Text style setup
    ctx.fillStyle = "#FFFFFF"; 
    ctx.shadowColor = "black";
    ctx.shadowBlur = 6;

    // Uptime calculate
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const ping = Date.now() - event.timestamp;
    const owner = "Saiful Islam ";

    // Title (left side)
    ctx.textAlign = "left";
    ctx.font = "bold 55px Arial";
    ctx.fillText("⚡ BOT STATUS ⚡", 50, 100);

    // Details with emoji
    ctx.font = "bold 40px Arial";
    ctx.fillText(`🕒 UPTIME : ${hours}h ${minutes}m ${seconds}s`, 50, 200);
    ctx.fillText(`📶 PING   : ${ping}ms`, 50, 270);
    ctx.fillText(`👑 OWNER  : ${owner}`, 50, 340);

    // Save temp file
    const outPath = path.join(__dirname, "cache", `status_${event.senderID}.png`);
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outPath, buffer);

    // Send photo
    return api.sendMessage(
      { body: "", attachment: fs.createReadStream(outPath) },
      event.threadID,
      () => fs.unlinkSync(outPath),
      event.messageID
    );

  } catch (err) {
    console.log(err);
    return api.sendMessage("❌ Error while generating status photo!", event.threadID, event.messageID);
  }
};
