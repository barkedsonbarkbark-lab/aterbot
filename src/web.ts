import HTTP from 'node:http';
import fs from 'fs';

const PORT = process.PORT || 5500;
const server = HTTP.createServer((request, response) => {
	if (request.url === '/view') {
		if (fs.existsSync('./botview.png')) {
			const img = fs.readFileSync('./botview.png');
			response.writeHead(200, { 'Content-Type': 'image/png' });
			response.end(img);
		} else {
			response.writeHead(404, { 'Content-Type': 'text/plain' });
			response.end('No view available yet');
		}
	} else {
		response.writeHead(200, {
			"Access-Control-Allow-Origin": "https://replit.com",
			"Access-Control-Allow-Methods": "GET, PING, OPTIONS",
			"Content-Type": "text/html"
		} as const);
		response.end("<h3>Bot View</h3><img src='/view' alt='Bot\\'s view' style='max-width:100%;'>");
	}
});



export default (): void => {
	server.listen(PORT, () => console.log("Server for UptimeRobot is ready!"));
};