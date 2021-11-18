#![allow(non_camel_case_types)]
#![allow(non_snake_case)]

use std::borrow::Cow;

use fxhash::FxHashMap;

use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::cardpool::Cardpool;
use crate::users::UserObject;

#[derive(Deserialize, Clone)]
#[serde(tag = "z")]
pub enum AuthMessage {
	modadd {
		m: String,
	},
	modrm {
		m: String,
	},
	modresetpass {
		m: String,
	},
	codesmithadd {
		m: String,
	},
	codesmithrm {
		m: String,
	},
	modguest {
		m: String,
	},
	modmute {
		m: String,
	},
	modclear,
	modmotd {
		m: String,
	},
	inituser {
		e: u8,
	},
	loginoriginal,
	initoriginal {
		e: u8,
		name: String,
	},
	logout,
	delete,
	setarena {
		d: String,
		#[serde(default)]
		r#mod: bool,
		lv: u8,
		hp: u16,
		draw: u8,
		mark: u8,
	},
	arenainfo,
	modarena {
		aname: String,
		won: bool,
		lv: u8,
	},
	foearena {
		lv: u8,
	},
	stat {
		#[serde(default)]
		set: String,
		stats: Vec<Value>,
		players: Vec<Value>,
	},
	setgold {
		t: String,
		g: i32,
	},
	addpool {
		t: String,
		pool: String,
		bound: bool,
	},
	codecreate {
		t: String,
	},
	codesubmit {
		code: String,
	},
	codesubmit2 {
		code: String,
		card: u16,
	},
	foewant {
		f: String,
		#[serde(default)]
		set: String,
		#[serde(default)]
		deck: String,
		deckcheck: bool,
	},
	canceltrade {
		f: String,
	},
	reloadtrade {
		f: String,
	},
	offertrade {
		f: String,
		forcards: Option<String>,
		forg: Option<u16>,
		cards: String,
		g: u16,
	},
	passchange {
		p: String,
	},
	challrecv {
		f: String,
		#[serde(default)]
		trade: bool,
	},
	chat {
		to: Option<String>,
		msg: String,
	},
	bzcancel {
		c: u16,
	},
	bzbid {
		price: i16,
		cards: String,
	},
	booster {
		pack: u8,
		bulk: u8,
		element: u8,
	},
	r#move {
		id: i64,
		prehash: i32,
		hash: i32,
		cmd: GamesMoveCmd,
	},
	reloadmoves {
		id: i64,
	},
	updateorig {
		deck: Option<String>,
	},
	origadd {
		pool: Option<String>,
		rmpool: Option<String>,
		electrum: Option<i16>,
	},
	roll {
		#[serde(rename = "A")]
		rolls: u8,
		#[serde(rename = "X")]
		sides: u32,
	},
	upgrade {
		card: u16,
	},
	downgrade {
		card: u16,
	},
	polish {
		card: u16,
	},
	unpolish {
		card: u16,
	},
	uppillar {
		c: u16,
	},
	shpillar {
		c: u16,
	},
	upshall,
	addgold {
		g: i16,
	},
	addloss {
		pvp: bool,
		l: Option<u8>,
		g: Option<i16>,
	},
	addwin {
		pvp: bool,
	},
	setstreak {
		l: u8,
		n: u16,
	},
	addcards {
		c: String,
	},
	addboundcards {
		c: String,
	},
	donedaily {
		#[serde(default)]
		c: u16,
		daily: u8,
	},
	changeqeck {
		name: String,
		number: u8,
	},
	setdeck {
		name: String,
		d: Option<String>,
	},
	rmdeck {
		name: String,
	},
	setquest {
		quest: String,
	},
}

#[derive(Deserialize, Clone)]
#[serde(tag = "x")]
pub enum UserMessage {
	a {
		u: String,
		a: String,
		#[serde(flatten)]
		msg: AuthMessage,
	},
	login {
		u: String,
		p: Option<String>,
		a: Option<String>,
	},
	konglogin {
		u: u64,
		g: String,
	},
	guestchat {
		u: String,
		msg: String,
	},
	motd,
	r#mod,
	codesmith,
	librarywant {
		f: String,
	},
	arenatop {
		lv: u8,
	},
	wealthtop,
	chatus {
		hide: Option<bool>,
		afk: Option<bool>,
	},
	who,
	bzread,
}

#[derive(Serialize, Clone)]
pub struct ArenaInfo {
	pub day: u32,
	pub draw: i32,
	pub mark: i32,
	pub hp: i32,
	pub win: i32,
	pub loss: i32,
	pub card: i32,
	pub deck: String,
	pub rank: i32,
	pub bestrank: i32,
}

#[derive(Serialize, Clone)]
#[serde(tag = "x")]
pub enum WsResponse<'a> {
	arenainfo {
		#[serde(rename = "A")]
		a1: Option<Box<ArenaInfo>>,
		#[serde(rename = "B")]
		a2: Option<Box<ArenaInfo>>,
	},
	arenatop {
		lv: u8,
		top: &'a [(String, i32, i32, i32, u32, i32)],
	},
	boostergive {
		cards: &'a Cardpool,
		accountbound: bool,
		packtype: u8,
	},
	bzbid {
		add: &'a FxHashMap<u16, Vec<BzBid<'a>>>,
		rm: &'a FxHashMap<u16, Vec<BzBid<'a>>>,
		g: i32,
		pool: &'a Cardpool,
	},
	#[serde(rename = "bzgive")]
	bzgivec {
		msg: &'a str,
		c: &'a str,
	},
	#[serde(rename = "bzgive")]
	bzgiveg {
		msg: &'a str,
		g: i32,
	},
	bzread {
		bz: &'a FxHashMap<u16, Vec<BzBid<'a>>>,
	},
	challenge {
		f: &'a str,
		set: &'a str,
		deckcheck: bool,
	},
	chat {
		mode: u8,
		msg: &'a str,
	},
	#[serde(rename = "chat")]
	chatu {
		mode: u8,
		msg: &'a str,
		u: &'a str,
	},
	#[serde(rename = "chat")]
	chatguest {
		guest: bool,
		msg: &'a str,
		u: &'a str,
	},
	clear,
	codecard {
		r#type: &'a str,
	},
	codecode {
		card: i32,
	},
	codedone {
		card: u16,
	},
	codegold {
		g: i32,
	},
	foearena {
		seed: u32,
		name: &'a str,
		hp: i32,
		mark: i32,
		draw: i32,
		deck: &'a str,
		rank: i64,
		lv: u8,
	},
	librarygive {
		pool: &'a Cardpool,
		bound: &'a Cardpool,
		gold: i32,
		pvpwins: i32,
		pvplosses: i32,
		aiwins: i32,
		ailosses: i32,
	},
	login(&'a UserObject),
	#[serde(rename = "login")]
	loginfail {
		err: &'a str,
	},
	r#move {
		cmd: GamesMoveCmd,
		hash: i32,
	},
	mute {
		m: &'a str,
	},
	offertrade {
		f: &'a str,
		c: &'a str,
		g: i32,
	},
	originaldata(&'a LegacyUser),
	#[serde(rename = "originaldata")]
	originaldataempty,
	passchange {
		auth: &'a str,
	},
	pvpgive {
		id: i64,
		data: &'a GamesData,
	},
	reloadmoves {
		moves: &'a [GamesMoveCmd],
	},
	roll {
		u: &'a str,
		#[serde(rename = "A")]
		rolls: u8,
		#[serde(rename = "X")]
		sides: u32,
		sum: u64,
	},
	tradecanceled {
		u: &'a str,
	},
	tradedone {
		oldcards: &'a str,
		newcards: &'a str,
		g: i32,
	},
	wealthtop {
		top: &'a [Value],
	},
}

#[derive(Serialize, Clone)]
pub struct BzBid<'a> {
	pub u: Cow<'a, str>,
	pub q: i32,
	pub p: i32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LegacyUser {
	pub pool: Cardpool,
	pub deck: String,
	pub electrum: i32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GamesData {
	pub set: String,
	pub seed: u32,
	pub players: Vec<GamesDataPlayer>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GamesDataPlayer {
	pub idx: u8,
	pub user: String,
	pub name: String,
	pub deck: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GamesMove {
	pub cmd: GamesMoveCmd,
	pub hash: i32,
}

#[derive(Serialize, Deserialize, Debug, Clone, Copy)]
#[serde(tag = "x")]
pub enum GamesMoveCmd {
	end {
		#[serde(default)]
		t: i32,
	},
	cast {
		c: i32,
		#[serde(default)]
		t: i32,
	},
	accept,
	mulligan,
	foe {
		t: i32,
	},
	resign {
		c: i32,
	},
}
