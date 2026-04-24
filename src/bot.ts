import Mineflayer from 'mineflayer';
import { sleep, getRandom } from "./utils.ts";
import CONFIG from "../config.json" assert { type: 'json' };
import { emitter } from './events.ts';

let loop: NodeJS.Timeout;
let viewLoop: NodeJS.Timeout;
let isControlMode = false;
let bot: Mineflayer.Bot;

const disconnect = (): void => {
	clearInterval(loop);
	clearInterval(viewLoop);
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

		if (!isControlMode) {
			loop = setInterval(() => {
				changeView();
				changePos();
			}, CONFIG.action.holdDuration);
		}

		viewLoop = setInterval(() => {
			const pos = bot.entity.position;
			const yaw = bot.entity.yaw;
			const pitch = bot.entity.pitch;
			const health = bot.health;
			const food = bot.food;
			const heldItem = bot.inventory.slots[bot.quickBarSlot];
			const heldName = heldItem ? heldItem.name : 'nothing';
			emitter.emit('view', { pos: { x: pos.x, y: pos.y, z: pos.z }, yaw, pitch, health, food, heldName });
		}, 100); // Update view every 100ms
	});

	bot.once('login', () => {
		console.log(`AFKBot logged in ${bot.username}\n\n`);
	});
};

emitter.on('setMode', (mode: string) => {
	if (mode === 'control') {
		clearInterval(loop);
		isControlMode = true;
	} else if (mode === 'afk') {
		isControlMode = false;
		loop = setInterval(() => {
			changeView();
			changePos();
		}, CONFIG.action.holdDuration);
	}
});

emitter.on('command', (cmd: string) => {
	if (!isControlMode) return;
	switch (cmd) {
		case 'forward':
			bot.setControlState('forward', true);
			setTimeout(() => bot.clearControlStates(), 500);
			break;
		case 'back':
			bot.setControlState('back', true);
			setTimeout(() => bot.clearControlStates(), 500);
			break;
		case 'left':
			bot.setControlState('left', true);
			setTimeout(() => bot.clearControlStates(), 500);
			break;
		case 'right':
			bot.setControlState('right', true);
			setTimeout(() => bot.clearControlStates(), 500);
			break;
		case 'jump':
			bot.setControlState('jump', true);
			setTimeout(() => bot.clearControlStates(), 500);
			break;
		case 'stop':
			bot.clearControlStates();
			break;
	}
});

// ✅ THIS is what fixes your error
const initBot = (): void => {
	createBot();
};

export default initBot;
