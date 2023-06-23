import { createSignal, onMount } from 'solid-js';
import { For } from 'solid-js/web';

import * as sock from '../sock.jsx';
import Cards from '../Cards.js';
import * as Tutor from '../Components/Tutor.jsx';
import * as etgutil from '../etgutil.js';
import { parseInput } from '../util.js';
import * as Components from '../Components/index.jsx';
import * as store from '../store.jsx';

const packdata = [
	{
		cost: 15,
		type: 'Bronze',
		info: '10 Commons. ~3.4% rarity bonus',
	},
	{
		cost: 25,
		type: 'Silver',
		info: '3 Commons, 3 Uncommons. ~6.8% rarity bonus',
	},
	{
		cost: 80,
		type: 'Gold',
		info: '1 Common, 2 Uncommons, 2 Rares. ~1.7% rarity bonus',
	},
	{ cost: 250, type: 'Nymph', info: '1 Nymph' },
];

function PackDisplay(props) {
	const [hoverCard, setHoverCard] = createSignal(null);
	const DeckDisplaySetCard = (i, card) => setHoverCard(card);
	const children = () => {
		const deck = etgutil.decodedeck(props.cards),
			dlen = etgutil.decklength(props.cards);
		const children = [];
		children.push(
			<Components.DeckDisplay
				cards={Cards}
				x={106}
				deck={deck.slice(0, 50)}
				onMouseOver={DeckDisplaySetCard}
			/>,
		);
		for (let start = 51; start < dlen; start += 70) {
			children.push(
				<Components.DeckDisplay
					cards={Cards}
					x={-92}
					y={244 + (((start - 51) / 70) | 0) * 200}
					deck={deck.slice(start, start + 70)}
					onMouseOver={DeckDisplaySetCard}
				/>,
			);
		}
		return children;
	};
	return (
		<div
			className="bgbox"
			style={{
				position: 'absolute',
				left: '0px',
				top: '12px',
				width: '756px',
				height: '588px',
				'z-index': '1',
				'overflow-y': 'auto',
			}}>
			<Components.Card card={hoverCard()} x={8} y={8} />
			{children}
		</div>
	);
}

export default function Shop() {
	const rx = store.useRedux();
	const bulk = () => rx.opts.bulk ?? '1';
	const [info1, setInfo1] = createSignal('Select from which element you want');
	const [info2, setInfo2] = createSignal('Select which type of pack you want');
	const [ele, setEle] = createSignal(-1);
	const [rarity, setRarity] = createSignal(-1);
	const [buy, setBuy] = createSignal(true);
	const [cards, setCards] = createSignal('');

	onMount(() => {
		store.store.dispatch(
			store.setCmds({
				boostergive: data => {
					const userdelta = {};
					if (data.accountbound) {
						userdelta.accountbound = etgutil.mergedecks(
							rx.user.accountbound,
							data.cards,
						);
						const freepacks = rx.user.freepacks && rx.user.freepacks.slice();
						if (freepacks) {
							freepacks[data.packtype]--;
							userdelta.freepacks = freepacks;
						}
					} else {
						const bdata = {};
						parseInput(bdata, 'bulk', bulk(), 99);
						userdelta.pool = etgutil.mergedecks(rx.user.pool, data.cards);
						userdelta.gold =
							rx.user.gold - packdata[data.packtype].cost * (bdata.bulk || 1);
					}
					store.store.dispatch(store.updateUser(userdelta));
					setCards(data.cards);
					setBuy(false);
					store.store.dispatch(
						store.chat(
							<a
								style={{ display: 'block' }}
								href={`deck/${data.cards}`}
								target="_blank">
								{data.cards}
							</a>,
							'Packs',
						),
					);
				},
			}),
		);
	});

	const buyPack = () => {
		const pack = packdata[rarity()];
		const boostdata = {
			pack: rarity(),
			element: ele(),
		};
		parseInput(boostdata, 'bulk', bulk(), 99);
		boostdata.bulk ||= 1;
		if (
			rx.user.gold >= pack.cost * (boostdata.bulk || 1) ||
			(rx.user.freepacks && rx.user.freepacks[rarity()] > 0)
		) {
			sock.userEmit('booster', boostdata);
			setBuy(false);
		} else {
			setInfo2("You can't afford that!");
		}
	};

	const hasFreePacks = () =>
		!!(rx.user.freepacks && rx.user.freepacks[rarity()]);
	const elebuttons = [];
	for (let i = 0; i < 14; i++) {
		elebuttons.push(
			<Components.IconBtn
				e={'e' + i}
				x={75 + (i >> 1) * 64}
				y={117 + (i & 1) * 75}
				click={() => {
					setEle(i);
					setInfo1(`Selected Element: ${i === 13 ? 'Random' : '1:' + i}`);
				}}
			/>,
		);
	}
	return (
		<>
			<Components.Box x={40} y={16} width={820} height={60} />
			<Components.Box x={40} y={89} width={494} height={168} />
			<Components.Box x={40} y={270} width={712} height={300} />
			<Components.Box x={768} y={90} width={94} height={184} />
			<Components.Text
				text={rx.user.gold + '$'}
				style={{
					position: 'absolute',
					left: '775px',
					top: '101px',
				}}
			/>
			<Components.Text
				text={info1()}
				style={{
					position: 'absolute',
					left: '50px',
					top: '25px',
				}}
			/>
			<span
				style={{
					position: 'absolute',
					left: '50px',
					top: '50px',
				}}>
				{info2()}
			</span>
			<Components.ExitBtn x={775} y={246} />
			{hasFreePacks() && (
				<span
					style={{
						position: 'absolute',
						left: '350px',
						top: '26px',
					}}>
					{!!rx.user.freepacks[rarity()] &&
						`Free ${packdata[rarity()].type} packs left: ${
							rx.user.freepacks[rarity()]
						}`}
				</span>
			)}
			{cards && (
				<input
					type="button"
					value="Take Cards"
					onClick={() => {
						setBuy(true);
						setCards('');
					}}
					style={{
						position: 'absolute',
						left: '775px',
						top: '156px',
					}}
				/>
			)}
			{buy() && !!~ele() && !!~rarity() && (
				<>
					{!hasFreePacks() && (
						<input
							type="button"
							value="Max Buy"
							onClick={() => {
								const pack = packdata[rarity()];
								store.store.dispatch(
									store.setOptTemp(
										'bulk',
										Math.min((rx.user.gold / pack.cost) | 0, 99).toString(),
									),
								);
							}}
							style={{
								position: 'absolute',
								left: '775px',
								top: '128px',
							}}
						/>
					)}
					<input
						type="button"
						value="Buy Pack"
						onClick={buyPack}
						style={{
							position: 'absolute',
							left: '775px',
							top: '156px',
						}}
					/>
				</>
			)}
			<For each={packdata}>
				{(pack, n) => (
					<>
						<img
							src={`/assets/pack${n()}.webp`}
							className="imgb"
							onClick={() => {
								setRarity(n());
								setInfo2(`${pack.type} Pack: ${pack.info}`);
							}}
							style={{
								position: 'absolute',
								left: `${48 + 176 * n()}px`,
								top: '278px',
							}}
						/>
						<Components.Text
							text={pack.cost + '$'}
							style={{
								position: 'absolute',
								left: `${48 + 176 * n()}px`,
								top: '542px',
								width: '160px',
								'text-align': 'center',
							}}
						/>
					</>
				)}
			</For>
			{elebuttons}
			{cards() && <PackDisplay cards={cards()} />}
			{!hasFreePacks() && !!~ele() && !!~rarity() && (
				<input
					type="number"
					placeholder="Bulk"
					value={bulk()}
					onChange={e =>
						store.store.dispatch(store.setOptTemp('bulk', e.target.value))
					}
					onKeyPress={e => {
						if (e.which === 13) buyPack();
					}}
					style={{
						position: 'absolute',
						top: '184px',
						left: '777px',
						width: '64px',
					}}
				/>
			)}
			<Tutor.Tutor x={8} y={500} panels={Tutor.Shop} />
		</>
	);
}