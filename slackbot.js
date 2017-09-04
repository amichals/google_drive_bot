var SlackBot = require('slackbots');

var bot = new SlackBot({
	token: 'xoxb-229227395859-572Lt6SgCa3uoWvLsxcfC7Tu',
	name: 'pole_chef_news'
});

function postMessage(msg) {
	console.log(msg);
	try {
		bot.postMessageToChannel('radio_pc_news', msg);
	} catch (e) {
		console.log(e)
	}
}

module.exports.postMessage = postMessage;
