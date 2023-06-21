import { useRedux } from '../store.jsx';
import { Dynamic } from 'solid-js/web';

export default function App(props) {
	const rx = useRedux();
	return <Dynamic component={rx.nav.view} {...rx.nav.props} />;
}