import {
	useBlockProps,
} from '@wordpress/block-editor';

export default function save() {
	return (
		<p { ...useBlockProps.save() }>
			{ 'Hello from the saved content!' }
		</p>
	);
}