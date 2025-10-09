const moment = require("moment-timezone");

module.exports.config = {
 name: "mentionBotAdmin",
 version: "1.0.2",
 permission: 0,
 credits: "nazrul",
 description: "বট এডমিনকে কেউ মেনশন করলে নির্দিষ্ট গ্রুপে রিপোর্ট পাঠাবে",
 commandCategory: "group",
 usages: "",
 cooldowns: 5,
};

// একাধিক এডমিন UID থাকলে এখানে রাখো
const BOT_ADMIN_UIDS = ["61577052283173",]; // <-- বট এডমিন UID
const REPORT_GROUP_TID = "1141573897399950"; // <-- রিপোর্ট যাবে এই গ্রুপে

module.exports.handleEvent = async ({ api, event }) => {
 try {
 const { mentions, threadID, senderID, body } = event;

 if (mentions && Object.keys(mentions).length > 0) {
 const mentionedUIDs = Object.keys(mentions);

 // চেক করো কোনো এডমিন মেনশন হয়েছে কি না
 const matchedAdmins = BOT_ADMIN_UIDS.filter(uid => mentionedUIDs.includes(uid));
 if (matchedAdmins.length > 0) {
 const userInfo = await api.getUserInfo(senderID);
 const threadInfo = await api.getThreadInfo(threadID);

 const senderName = userInfo[senderID]?.name || "Unknown";
 const groupName = threadInfo?.threadName || "Unknown Group";

 const timeNow = moment().tz("Asia/Dhaka").format("hh:mm A");
 const dateNow = moment().tz("Asia/Dhaka").format("DD MMMM YYYY, dddd");

 const msg = 
`📣 বট এডমিনকে মেনশন করা হয়েছে!

👤 ইউজার: ${senderName}
🆔 UID: ${senderID}
🏷️ গ্রুপ: ${groupName}
🆔 Group ID: ${threadID}
🕒 সময়: ${timeNow}
📅 তারিখ: ${dateNow}
💬 বার্তা: ${body}`;

 return api.sendMessage(msg, REPORT_GROUP_TID);
 }
 }
 } catch (err) {
 console.error("[mentionBotAdmin]", err);
 }
};

module.exports.run = () => {};
