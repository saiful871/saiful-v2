const fs = require("fs");
const path = require("path");

module.exports.config = {
	name: "leave",
	eventType: ["log:unsubscribe"],
	version: "1.0.3",
	credits: "rX",
	description: "Send message and video when someone leaves or is kicked",
	dependencies: {}
};

module.exports.run = async function({ api, event }) {
	const { threadID, logMessageData } = event;

	// Jodi bot-i leave kore
	if (logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

	// User name fetch kora
	let userName = "Someone";
	try {
		const userInfo = await api.getUserInfo(logMessageData.leftParticipantFbId);
		userName = userInfo[logMessageData.leftParticipantFbId].name || "Someone";
	} catch (e) {
		console.error(e);
	}

	// Message determine kora
	let msg = "";
	if (logMessageData.kickParticipants && logMessageData.kickParticipants.length > 0) {
		msg = `${userName} kicked from the group.`;
	} else {
		msg = "Nice knowing him.";
	}

	// Video path
	const videoPath = path.join(__dirname, "cache", "leave.mp4");

	// Send message + video
	if (fs.existsSync(videoPath)) {
		return api.sendMessage({ body: msg, attachment: fs.createReadStream(videoPath) }, threadID);
	} else {
		return api.sendMessage(msg, threadID);
	}
};
