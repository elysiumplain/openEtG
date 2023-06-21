import { createEffect, createRenderEffect } from 'solid-js';
import { For } from 'solid-js/web';
import { useRedux } from '../store.jsx';

export default function Chat(props) {
	const rx = useRedux();
	let chat = null,
		scrollTop = null;

	createRenderEffect(channel => {
		rx.chat;
		scrollTop =
			chat &&
			props.channel === channel &&
			Math.abs(chat.scrollTop - chat.scrollHeight + chat.offsetHeight) >= 8
				? chat.scrollTop
				: -1;
		return props.channel;
	}, props.channel);
	createEffect(() => {
		rx.chat;
		chat.scrollTop = ~scrollTop ? scrollTop : chat.scrollHeight;
	});

	return (
		<div className="chatBox" style={props.style} ref={chat}>
			<For each={rx.chat.get(props.channel)}>{span => span()}</For>
		</div>
	);
}