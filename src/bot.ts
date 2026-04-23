bot.once('spawn', () => {
	const registerAndLogin = async (): Promise<void> => {
		await sleep(1000); // small delay after spawn

		bot.chat('/register AlwaysOnline34');
		await sleep(1500); // wait for register to process

		bot.chat('/login AlwaysOnline34');
	};

	registerAndLogin();

	const changePos = async (): Promise<void> => {
		const lastAction = getRandom(CONFIG.action.commands) as Mineflayer.ControlState;
		const halfChance: boolean = Math.random() < 0.5;

		console.debug(`${lastAction}${halfChance ? " with sprinting" : ''}`);

		bot.setControlState('sprint', halfChance);
		bot.setControlState(lastAction, true);

		await sleep(CONFIG.action.holdDuration);
		bot.clearControlStates();
	};

	const changeView = async (): Promise<void> => {
		const yaw = (Math.random() * Math.PI) - (0.5 * Math.PI),
			pitch = (Math.random() * Math.PI) - (0.5 * Math.PI);

		await bot.look(yaw, pitch, false);
	};

	loop = setInterval(() => {
		changeView();
		changePos();
	}, CONFIG.action.holdDuration);
});
