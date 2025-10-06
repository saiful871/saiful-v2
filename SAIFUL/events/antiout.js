module.exports.config = {
  name: "antiout",
  eventType: ["log:unsubscribe"],
  version: "1.3.0",
  credits: "Mohammad Akash",
  description: "Adds members back automatically with premium card-style messages",
};

module.exports.run = async ({ event, api, Threads, Users }) => {
  try {
    let threadData = (await Threads.getData(event.threadID)).data || {};
    if (threadData.antiout === false) return;
    if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

    const userId = event.logMessageData.leftParticipantFbId;
    const name = global.data.userName.get(userId) || await Users.getNameUser(userId);
    const leftType = (event.author == userId) ? "self-separation" : "forced-leave";

    if (leftType === "self-separation") {
      api.addUserToGroup(userId, event.threadID, (error) => {
        if (error) {
          api.sendMessage(
            `🛑 ──────[❌ 𝐀𝐂𝐂𝐄𝐒𝐒 𝐃𝐄𝐍𝐈𝐄𝐃 ❌]────── 🛑\n\n💀 হায়! ${name}, তোকে আবার এড করতে পারলাম না।\nসম্ভবত প্রাইভেসি সেটিংসের কারণে ব্লক আছে।\n\n🖤 চেষ্টা আবার হবে!`,
            event.threadID
          );
        } else {
          api.sendMessage(
            `🌑 ──────[💎 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 𝐄𝐃𝐈𝐓 💎]────── 🌑\n\n🔥 𝙃𝙚𝙮 ${name}!\nতুই পারমিশন ছাড়া লিভ করেছোস, কিন্তু আমরা প্রিমিয়াম স্টাইল মানি 😎\n✨ তোকে আবার গ্রুপে এড করে দিলাম! দারুণ অভিজ্ঞতা উপভোগ কর 💎`,
            event.threadID
          );
        }
      });
    } else {
      api.sendMessage(
        `⚡ ──────[👑 𝐀𝐃𝐌𝐈𝐍 𝐀𝐂𝐓𝐈𝐎𝐍 👑]────── ⚡\n\n${name} কে গ্রুপ থেকে সরানো হয়েছে।\n🖤 নিয়ম হলো নিয়মেই চলবে!`,
        event.threadID
      );
    }
  } catch (err) {
    console.error("AntiOut Module Error:", err);
  }
};
