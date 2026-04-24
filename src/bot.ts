import Mineflayer from 'mineflayer';
import { sleep, getRandom } from "./utils.ts";
import CONFIG from "../config.json" assert { type: 'json' };
import fs from 'fs';

let loop: NodeJS.Timeout;
let screenshotLoop: NodeJS.Timeout;
let bot: Mineflayer.Bot;

const disconnect = (): void => {
	clearInterval(loop);
	clearInterval(screenshotLoop);
	bot?.quit?.();
	bot?.end?.();
};

const reconnect = async (): Promise<void> => {
	console.log(`Trying to reconnect in ${CONFIG.action.retryDelay / 1000} seconds...\n`);

	disconnect();
	await sleep(CONFIG.action.retryDelay);
	createBot();
};

const createBot = (): void => {
	bot = Mineflayer.createBot({
	host: CONFIG.client.host,
	port: +CONFIG.client.port,
	username: CONFIG.client.username, // your Microsoft email
	auth: "offline"
} as const);

	bot.once('error', error => {
		console.error(`AFKBot got an error: ${error}`);
	});

	bot.once('kicked', rawResponse => {
		console.error(`\n\nAFKbot is disconnected: ${rawResponse}`);
	});

	bot.once('end', () => void reconnect());

	bot.once('spawn', () => {
		// 🔐 Register + Login
		const registerAndLogin = async (): Promise<void> => {
			await sleep(1000);

			bot.chat('/register AlwaysOnline34');
			await sleep(1500);

			bot.chat('/login AlwaysOnline34');
		};

		registerAndLogin();

		// 🎮 Movement
		const changePos = async (): Promise<void> => {
			const lastAction = getRandom(CONFIG.action.commands) as Mineflayer.ControlState;
			const halfChance = Math.random() < 0.5;

			console.debug(`${lastAction}${halfChance ? " with sprinting" : ''}`);

			bot.setControlState('sprint', halfChance);
			bot.setControlState(lastAction, true);

			await sleep(CONFIG.action.holdDuration);
			bot.clearControlStates();
		};

		// 👀 View movement
		const changeView = async (): Promise<void> => {
			const yaw = (Math.random() * Math.PI) - (0.5 * Math.PI);
			const pitch = (Math.random() * Math.PI) - (0.5 * Math.PI);

			await bot.look(yaw, pitch, false);
		};

		loop = setInterval(() => {
			changeView();
			changePos();
		}, CONFIG.action.holdDuration);

		screenshotLoop = setInterval(async () => {
			try {
				const screenshot = await bot.createScreenshot();
				fs.writeFileSync('./botview.png', screenshot);
			} catch (error) {
				console.error('Failed to take screenshot:', error);
			}
		}, 5000); // Take screenshot every 5 seconds
	});

	bot.once('login', () => {
		console.log(`AFKBot logged in ${bot.username}\n\n`);
	});
};

// ✅ THIS is what fixes your error
const initBot = (): void => {
	createBot();
};

export default initBot;
