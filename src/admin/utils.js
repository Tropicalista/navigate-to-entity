/**
 * Retrieves the unique topics from an array of photos.
 */
export const getTopicsElementsFormat = ( photos ) => {
	const topics = photos.reduce( ( acc, photo ) => {
		return acc.concat( photo.topics );
	}, [] );
	return [ ...new Set( topics ) ].map( ( topic ) => {
		return {
			label: topic
				.replace( /-/g, ' ' )
				.replace( /\b\w/g, ( l ) => l.toUpperCase() ),
			value: topic,
		};
	} );
};