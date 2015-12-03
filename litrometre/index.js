var WebSocketServer = require('ws').Server;
var express = require('express');
var bodyParser = require('body-parser');

var password = 'qboule';

/*
 *	Initialisation du jeu
 *
 */
var scores = {
	alpha: 0,
	beta: 0,
	gamma: 0,
	delta: 0
};
var spectators = [];
var operations = [];

/*
 *	Connexions normales
 *
 */
var app = express();
var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.get('/', function(req, res) {
	res.render('index', {name: ''});
});
app.post('/', function(req, res) {
	if(req.body.password == password && req.body.name !== '') {
		res.render('server', {name: req.body.name});
	}
	else {
		res.render('index', {name: req.body.name});
	}
});
app.get('/spectator', function(req, res) {
	res.render('spectator');
});
app.use(express.static('public'));
app.get('/init', function(req, res) {
	res.render('init');
});
app.post('/init', function(req, res) {
	if(req.body.password == password) {
		scores = {
			alpha: 0,
			beta: 0,
			gamma: 0,
			delta: 0
		}
		summariseAll();
	}
	res.render('init');
});
app.listen(80);

/*
 *	Connexions des web sockets
 *
 */
var wss = new WebSocketServer({port: 8080});
wss.on('connection', function(ws) {
	ws.on('message', function(message) {
		var data = JSON.parse(message);

		switch(data.type) {
			case 'serve' :
				serve(data.server, data.faction, data.kind, data.quantity)
				break;
			case 'spectator' :
				spectators.push(ws);
				summarise(ws);
				break;
		};
	});

	ws.on('close', function() {
		if(spectators.indexOf(ws) !== -1)
			spectators.splice(spectators.indexOf(ws), 1);
	})
});

function serve(server, faction, kind, quantity) {
	var end;
	switch(kind) {
		case 'un demi' :
			end = '...';
			break;
		case 'une pinte' :
			end = '.';
			break;
		case 'un pichet' :
			end = ' !';
			break;
		case 'un mètre' :
			end = ' !!!';
			break;
		default :
			end = '.';
			break;
	}

	var operation = {
		server: server,
		faction: faction,
		kind: kind,
		quantity: quantity
	};

	scores[faction] += quantity;

	operations.push(operation);

	relay(operation);
};

function relay(operation) {
	var message = {
		type: 'operation',
		operation: operation
	};
	for(var k = 0; k < spectators.length; k++) {
		spectators[k].send(JSON.stringify(message));
	}
};

function summariseAll() {
	for(var k = 0; k < spectators.length; k++) {
		summarise(spectators[k]);
	}
}

function summarise(socket) {
	var message = {
		type: 'scores',
		scores: scores
	};
	socket.send(JSON.stringify(message));
};

console.log('Server started');
console.log('━━━━━━━━━━━━━━');