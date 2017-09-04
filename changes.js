var google = require('googleapis');
var drive = google.drive('v3');
var savedStartPageToken;

function getPageToken(auth, callback)
{
	drive.changes.getStartPageToken({
		auth: auth
	}, function(err, res) {
		if (err) {
			console.error('toto', err);

			return ;
		}
		console.log("Start token: ", res.startPageToken);
		callback(res.startPageToken);
	});
}

var fetchChanges = function(pageToken, pageFn, auth, bot) {
	var drive = google.drive('v3');

	drive.changes.list({
		auth: auth,
		pageToken: pageToken,
		fields: 'changes',
		restrictToMyDrive: false,
		includeRemoved: true
	}, function(err, res) {
		changes = res.changes;

		if (err) {
			console.error(err);
		} else {
			console.log('yo');
			res.changes.forEach(function(change) {
				// console.log change pour afficher toutes les infos et savoir quoi recup
				console.log("Change :", change.file.webViewLink);
				bot.postMessageToChannel('radio_pc_news', "Change in file :" + change.file.webViewLink);
			});

			if (res.newStartPageToken) {
				console.error(err);
			}
			if (res.nextPageToken) {
				pageFn(res.nextPageToken, pageFn);
			}
		}
	});
};

module.exports.fetchChanges = fetchChanges;
module.exports.getPageToken = getPageToken;
