import * as etg from './etg.js';
import * as etgutil from './etgutil.js';
import OriginalCards from './vanilla/Cards.js';
import OpenCards from './Cards.js';
import { entitySkillText } from './skillText.js';
import enums from './enum.json' assert { type: 'json' };
import { randint, decodeSkillName, read_skill, read_status } from './util.js';
import * as wasm from './rs/pkg/etg.js';

const infoskipkeys = new Set(['casts', 'gpull', 'hp', 'maxhp']);
function plinfocore(info, key, val) {
	if (val === true) info.push(key);
	else if (val) info.push(val + key);
}

export default class Game extends wasm.Game {
	constructor(data) {
		super(data.seed, wasm.CardSet[data.set] ?? wasm.CardSet.Open);
		this.__proto__ = Game.prototype;
		this.data = data;
		this.replay = [];
		const players = [];
		const playersByIdx = new Map();
		for (let i = 0; i < data.players.length; i++) {
			const id = this.new_player(),
				pdata = data.players[i];
			players.push(id);
			playersByIdx.set(pdata.idx, id);
		}
		for (let i = 0; i < players.length; i++) {
			const pdata = data.players[i];
			this.set_leader(players[i], playersByIdx.get(pdata.leader ?? pdata.idx));
		}
		for (let i = 0; i < players.length; i++) {
			let mark = 0;
			const dp = data.players[i],
				deck = [];
			for (const code of etgutil.iterdeck(dp.deck)) {
				let idx;
				if (this.Cards.Codes[code]) {
					deck.push(code);
				} else if (~(idx = etgutil.fromTrueMark(code))) {
					mark = idx;
				}
			}
			this.init_player(
				players[i],
				dp.hp ?? 100,
				dp.maxhp ?? dp.hp ?? 100,
				mark,
				dp.drawpower ?? 1,
				dp.deckpower ?? (dp.drawpower > 1 ? 2 : 1),
				dp.markpower ?? 1,
				deck,
			);
		}
	}

	get Cards() {
		return this.data?.set === 'Original' ? OriginalCards : OpenCards;
	}

	getCard(id) {
		return this.Cards.Codes[this.get(id, 'card')];
	}

	clone() {
		const obj = this.clonegame();
		obj.__proto__ = Game.prototype;
		obj.data = this.data;
		obj.replay = this.replay.slice();
		return obj;
	}
	userId(name) {
		const pldata = this.data.players;
		for (let i = 0; i < pldata.length; i++) {
			if (pldata[i].user === name) {
				return this.player_idx(i);
			}
		}
		return null;
	}
	playerDataByIdx(idx) {
		const pldata = this.data.players;
		for (let i = 0; i < pldata.length; i++) {
			if (pldata[i].idx === idx) {
				return pldata;
			}
		}
		return null;
	}
	get(id, key) {
		return this.get_stat(id, enums.StatId[key] ?? enums.FlagId[key]);
	}
	aiSearch() {
		const cmd = this.aisearch();
		return {
			x: wasm.GameMoveType[cmd.x],
			c: cmd.c,
			t: cmd.t,
		};
	}
	countPlies() {
		if (!this.replay) return -1;
		let plies = 0;
		for (const { x } of this.replay) {
			if (x === 'end') plies++;
		}
		return plies;
	}
	nextCmd(cmd, fx = true) {
		if (this.replay) this.replay.push(cmd);
		return this.next(wasm.GameMoveType[cmd.x], cmd.c | 0, cmd.t | 0, fx);
	}
	withMoves(moves) {
		const newgame = new Game(this.data);
		for (const move of moves) {
			newgame.next(move, false);
		}
		return newgame;
	}
	expectedDamage(samples) {
		return this.expected_damage(samples);
	}
	replayJson() {
		return (
			this.replay &&
			JSON.stringify({
				date: this.time,
				seed: this.data.seed,
				set: this.data.set,
				players: this.data.players,
				moves: this.replay,
			})
		);
	}
	statusesOf(id) {
		return read_status(this.get_stats(id));
	}
	skillsOf(id) {
		return read_skill(this.get_skills(id));
	}
	getSkill(id, k) {
		const name = Array.from(
			this.get_one_skill(id, enums.EventId[k]),
			decodeSkillName,
		);
		if (name.length) return name;
	}
	info(id) {
		const kind = this.get_kind(id);
		const type = kind === wasm.Kind.Spell ? this.getCard(id).type : kind;
		if (type == wasm.Kind.Player) {
			const info = [
				`${this.get(id, 'hp')}/${this.get(id, 'maxhp')} ${this.deck_length(
					id,
				)}cards`,
			];
			for (const [k, v] of this.statusesOf(id)) {
				if (!infoskipkeys.has(k) || !v) plinfocore(info, k, v);
			}
			info.push(this.get_drawpower(id) + 'drawpower');
			if (this.get(id, 'casts') === 0) info.push('silenced');
			if (this.get(id, 'gpull')) info.push('gpull');
			return info.join('\n');
		} else {
			const info =
				type === wasm.Kind.Creature || type === wasm.Kind.Weapon
					? `${this.trueatk(id)}|${this.truehp(id)}/${this.get(id, 'maxhp')}`
					: type === wasm.Kind.Shield
					? this.truedr(id).toString()
					: '';
			const stext = entitySkillText(this, id);
			return !info ? stext : stext ? info + '\n' + stext : info;
		}
	}
}
