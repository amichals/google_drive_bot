var bot = require('./slackbot');
var express = require('express');
var app = express();

app.get('/', function (req, res) {
	bot.postMessage('ceci est un test');
	res.send('Hello World!');
});

app.listen(3000, function () {
	console.log('Example app listening on port 3000!');
});
