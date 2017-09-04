var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var drive = google.drive('v3');
var change = require('./changes');
var SlackBot = require('slackbots');
var bot = new SlackBot({
	token: 'xoxb-229227395859-572Lt6SgCa3uoWvLsxcfC7Tu',
	name: 'pole_chef_news'
});

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/drive-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
	process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
	if (err) {
		console.log('Error loading client secret file: ' + err);
		return;
	}
	// Authorize a client with the loaded credentials, then call the
	// Drive API.
//	authorize(JSON.parse(content), listFiles);
	authorize(JSON.parse(content), function (auth) {
		change.getPageToken(auth, function (token) {
			console.log(token)
			authorize(JSON.parse(content), function (auth) {
				callFetchChanges(auth, token)
				setTimeout(function () {
					callFetchChanges(auth, token)
					setTimeout(process.exit, 60000);
				}, 30000);
			});	
		});
	});
});

function callFetchChanges(auth, token)
{
	console.log('/******' + token + '*********\\')
	change.fetchChanges(
			token,
			change.fetchChanges,
			auth,
			bot
	);

}

/**
 ** Create an OAuth2 client with the given credentials, and then execute the
 ** given callback function.
 **
 ** @param {Object} credentials The authorization client credentials.
 ** @param {function} callback The callback to call with the authorized client.
 **/
function authorize(credentials, callback) {
	console.log(credentials);
	var clientSecret = credentials.installed.client_secret;
	var clientId = credentials.installed.client_id;
	var redirectUrl = credentials.installed.redirect_uris[0];
	var auth = new googleAuth();
	var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
	// Check if we have previously stored a token.
	fs.readFile(TOKEN_PATH, function(err, token) {
		if (err) {
			getNewToken(oauth2Client, callback);
		} else {
			oauth2Client.credentials = JSON.parse(token);
			callback(oauth2Client);
		}
	});

}

/**
 ** Get and store new token after prompting for user authorization, and then
 ** execute the given callback with the authorized OAuth2 client.
 **
 ** @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 ** @param {getEventsCallback} callback The callback to call with the authorized
 **     client.
 **/
function getNewToken(oauth2Client, callback) {
	var authUrl = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES
	});
	console.log('Authorize this app by visiting this url: ', authUrl);
	var rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	rl.question('Enter the code from that page here: ', function(code) {
		rl.close();
		oauth2Client.getToken(code, function(err, token) {
			if (err) {
				console.log('Error while trying to retrieve access token', err);
				return;
			}
			oauth2Client.credentials = token;
			storeToken(token);
			callback(oauth2Client);
		});
	});
}

/**
 ** Store token to disk be used in later program executions.
 **
 ** @param {Object} token The token to store to disk.
 **/
function storeToken(token) {
	try {
		fs.mkdirSync(TOKEN_DIR);
	} catch (err) {
		if (err.code != 'EEXIST') {
			throw err;
		}
	}
	fs.writeFile(TOKEN_PATH, JSON.stringify(token));
	console.log('Token stored to ' + TOKEN_PATH);
}

/**
 ** Lists the names and IDs of up to 10 files.
 **
 ** @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 **/
function listFiles(auth) {
	var service = google.drive('v3');
	service.files.list({
		auth: auth,
		pageSize: 1000,
		q: "mimeType != 'image/jpeg' and mimeType != 'image/png' and mimeType != 'audio/mp3' and mimeType != 'application/pdf' and mimeType != 'video/mp4' and mimeType != 'application/vnd.google-apps.folder' and mimeType != 'image/gif' and mimeType != 'image/vnd.adobe.photoshop' and mimeType != 'video/quicktime'",
		fields: "nextPageToken, files(id, name)"
	}, function(err, response) {
		if (err) {
			console.log('The API returned an error: ' + err);
			return;
		}
		var files = response.files;
		if (files.length == 0) {
			console.log('No files found.');
		} else {
			console.log('Files:');
			for (var i = 0; i < files.length; i++) {
				var file = files[i];
				console.log('%s (%s)', file.name, file.id);
			}
		}
	});
}
