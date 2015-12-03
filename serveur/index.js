var http = require('http');

const PORT=8080;

function handleRequest(request, response) {
	response.end('It works !! YAY Et c\'est ' + request.url);
}

var server = http.createServer(handleRequest);

server.listen(PORT, function() {
	console.log('http://localhost:%s', PORT);
});