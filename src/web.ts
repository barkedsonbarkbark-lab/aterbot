import HTTP from 'node:http';
import { emitter } from './events.ts';

const PORT = process.PORT || 5500;
const clients = new Set<HTTP.ServerResponse>();

const server = HTTP.createServer((request, response) => {
	if (request.url === '/stream') {
		response.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive',
			'Access-Control-Allow-Origin': '*',
		});
		clients.add(response);
		request.on('close', () => clients.delete(response));
	} else {
		response.writeHead(200, {
			"Access-Control-Allow-Origin": "https://replit.com",
			"Access-Control-Allow-Methods": "GET, PING, OPTIONS",
			"Content-Type": "text/html"
		} as const);
		response.end(`<h3>Bot View</h3><div id="view" style="font-family: monospace; font-size: 18px;">Waiting for view data...</div>
<script>
const es = new EventSource('/stream');
es.onmessage = e => {
	const data = JSON.parse(e.data);
	document.getElementById('view').innerText = \`Position: (\${data.pos.x.toFixed(2)}, \${data.pos.y.toFixed(2)}, \${data.pos.z.toFixed(2)})
Yaw: \${data.yaw.toFixed(2)}, Pitch: \${data.pitch.toFixed(2)}\`;
};
</script>`);
	}
});



emitter.on('view', (data: any) => {
	for (const client of clients) {
		client.write(`data: ${JSON.stringify(data)}\n\n`);
	}
});

export default (): void => {
	server.listen(PORT, () => console.log("Server for UptimeRobot is ready!"));
};