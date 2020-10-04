export default function (deck) {
	const spellList = [
		'4vo',
		'4vn',
		'52s',
		'5c9',
		'5f8',
		'5li',
		'5op',
		'61r',
		'622',
		'8pi',
	];
	const perms = {},
		spells = {};
	let creatures = 0;
	for (let i = 0; i < deck.length; i++) {
		const card = deck[i];
		if (~etg.ShardList.indexOf(card.code)) return 'Shards are banned';
		if (card.upped) 'Upgraded cards are banned';
		if (card === Cards.Chimera || card.type === etg.Creature) creatures++;
		if (
			card.type === etg.Permanent ||
			card.type === etg.Weapon ||
			card.type === etg.Shield
		) {
			perms[card.code] = (perms[card.code] ?? 0) + 1;
		}
		if (~spellList.indexOf(card.code)) {
			spells[card.code] = (spells[card.code] ?? 0) + 1;
		}
	}
	if (deck.length > 45) return 'Deck too large';
	const races = [];
	if (creatures >= deck.length / 2 && deck.length <= 35)
		races.push('Zerg legal');
	let p3s = 0;
	for (let p in perms) {
		if (perms[p] >= 3) p3s++;
	}
	if (p3s >= 3) races.push('Terran legal');
	if (deck.length <= 40) {
		for (const s1 in spells) {
			for (const s2 in spells) {
				if (s1 !== s2 && spells[s1] + spells[s2] >= 7) {
					races.push('Protoss legal');
					return races.join(', ');
				}
			}
		}
	}
	return races.length ? races.join(', ') : 'Illegal';
}
