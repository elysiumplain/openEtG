import { render } from 'solid-js/web';
import { Provider } from 'react-redux';

import { store, chatMsg } from '../store.jsx';

let lastError = 0;
window.onerror = function (...args) {
	const now = Date.now();
	if (lastError + 999 < now) {
		store.dispatch(chatMsg(args.join(', '), 'System'));
		lastError = now;
	}
};

import { emit } from '../sock.jsx';
import App from '../views/App.jsx';
import Rightpane from '../views/Rightpane.jsx';

render(
	() => (
		<Provider store={store}>
			<App />
		</Provider>
	),
	document.getElementById('leftpane'),
);
render(
	() => (
		<Provider store={store}>
			<Rightpane />
		</Provider>
	),
	document.getElementById('rightpane'),
);

emit({ x: 'motd' });