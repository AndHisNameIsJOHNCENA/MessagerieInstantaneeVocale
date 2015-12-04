const PORT = 8080;
const DB_URL = "mongodb://localhost:27017/db";
const COLLECTIONS = ["messages"];

var http = require('http'),
	fs = require('fs'),
	mongojs = require('mongojs'),
	moment = require('moment');

var db = mongojs(DB_URL, COLLECTIONS);

function handleRequest(request, response) {
	fs.readFile('chat.html', function(err, html) {
		if (err) {
			throw err;
		}
		if (request.method === "POST") {
			var body = '';
			request.on('data', function(data) {
				body += data;
			});
			request.on('end', function() {
				db.messages.save({date: Date.now(), msg: body.substring(4)});
			});
		}

		response.writeHeader(200, {'Content-Type': 'text/html'});
		
		db.messages.find().sort({date: 1}, function(err, messages) {
			if (err || messages == []) {
				console.log(err);
				html = html.toString().replace('<div id="chat">',
						'<div id="chat">'
							+ '<p>Aucun message !</p>\n');
			} else {
				html = html.toString();
				messages.forEach(function(message) {
					html = html.replace('<div id="chat">',
							'<div id="chat">'
								+ '<p>' + moment(message.date).format('HH:mm:ss')
								+ ' | ' + message.msg + '</p>');
				});
			}
			response.write(html);
			response.end();
		});
	});
}

var server = http.createServer(handleRequest);

server.listen(PORT, function() {
	console.log('http://localhost:%s', PORT);
});