import HTTP from 'node:http';
import { emitter } from './events.ts';

const PORT = process.PORT || 5500;
const clients = new Set<HTTP.ServerResponse>();
let latestScreenshot: Buffer | null = null;

const server = HTTP.createServer((request, response) => {
	if (request.url === '/view') {
		if (latestScreenshot) {
			response.writeHead(200, { 'Content-Type': 'image/png' });
			response.end(latestScreenshot);
		} else {
			response.writeHead(404, { 'Content-Type': 'text/plain' });
			response.end('No view available yet');
		}
	} else if (request.url === '/stream') {
		response.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive',
			'Access-Control-Allow-Origin': '*',
		});
		clients.add(response);
		request.on('close', () => clients.delete(response));
		if (latestScreenshot) {
			const base64 = latestScreenshot.toString('base64');
			response.write(`data: ${base64}\n\n`);
		}
	} else {
		response.writeHead(200, {
			"Access-Control-Allow-Origin": "https://replit.com",
			"Access-Control-Allow-Methods": "GET, PING, OPTIONS",
			"Content-Type": "text/html"
		} as const);
		response.end(`<h3>Bot View</h3><img id="view" src="/view" alt="Bot's view" style="max-width:100%;">
<script>
const es = new EventSource('/stream');
es.onmessage = e => document.getElementById('view').src = 'data:image/png;base64,' + e.data;
</script>`);
	}
});



emitter.on('screenshot', (buffer: Buffer) => {
	latestScreenshot = buffer;
	const base64 = buffer.toString('base64');
	for (const client of clients) {
		client.write(`data: ${base64}\n\n`);
	}
});

export default (): void => {
	server.listen(PORT, () => console.log("Server for UptimeRobot is ready!"));
};