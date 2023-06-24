import { createSignal } from 'solid-js';
import { For } from 'solid-js/web';
import { useRedux } from '../store.jsx';
import { Text } from './index.jsx';

export function Tutor(props) {
	const rx = useRedux();
	const [tut, setTut] = createSignal(false);
	return (
		<>
			{!rx.opts.disableTut && (
				<>
					<span
						className="imgb ico e13"
						onMouseEnter={() => setTut(true)}
						onMouseLeave={() => setTut(false)}
						style={{
							position: 'absolute',
							left: props.x + 'px',
							top: props.y + 'px',
							'z-index': -1,
						}}
					/>
					{tut() && (
						<div className="tutorialbg">
							<For each={props.panels}>
								{([style, text]) => (
									<Text className="tutorialbox" text={text} style={style} />
								)}
							</For>
						</div>
					)}
				</>
			)}
		</>
	);
}

export const Editor = [
	[
		{ position: 'absolute', left: '100px', top: '48px', width: '624px' },
		'This is your deck. The Decks button opens the deck manager\nYou can also filter your decks with the /decks command in chat',
	],
	[
		{ position: 'absolute', left: '298px', top: '6px', width: '426px' },
		'Clicking a quickload slot loads the deck saved there',
	],
	[
		{ position: 'absolute', left: '100px', top: '232px', width: '418px' },
		'Choose a mark. You gain quanta for that element each turn',
	],
	[{ left: '520px', top: '236px' }, 'This is your deck code'],
	[
		{
			position: 'absolute',
			left: '2px',
			top: '350px',
			width: '250px',
			height: '100px',
		},
		'Click these elements to show cards of that element\nThe rarity filters only show cards of that rarity, except pillar filter which shows all cards',
	],
	[
		{ position: 'absolute', left: '300px', top: '350px', width: '320px' },
		'Clicking a card adds it to your deck',
	],
	[
		{ position: 'absolute', left: '88px', top: '530px' },
		": Shows all cards, including those you don't own",
	],
	[
		{ position: 'absolute', left: '88px', top: '575px' },
		": Don't show shiny cards",
	],
];
export const Shop = [
	[
		{
			position: 'absolute',
			left: '45px',
			top: '97px',
			width: '520px',
			height: '158px',
		},
		'1) Select the element of the pack you want to buy\nEach card has a 50% chance of being in the chosen element\nRandom pack means the cards is completely random instead',
	],
	[
		{
			position: 'absolute',
			left: '45px',
			top: '275px',
			width: '610px',
			height: '158px',
		},
		'2) Select the type of pack you want\nYou see the amount of cards & rarity of each pack in the upper box',
	],
	[
		{
			position: 'absolute',
			left: '590px',
			top: '97px',
			width: '260px',
			height: '158px',
		},
		'3) Buy the pack you selected!\nIf you want to buy many packs at once, type in the Bulk box how many you want',
	],
];