const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

function extendSharedConfig( config ) {
	return {
		...config,
		// Add shared config extensions here...
	};
}

function extendScriptConfig( config ) {
	return {
		...config,
		// Add non-module config extensions here...
		entry: {
			...config.entry(),
			admin: [ path.resolve( __dirname, 'src', 'admin', 'index.js' ) ],
		},
		output: {
			filename: '[name].js',
			path: path.resolve( process.cwd(), 'build' ),
		},
	};
}

function extendModuleConfig( config ) {
	return {
		...config,
		entry: {
			...config.entry(),
		},
	};
}

module.exports = ( () => {
	if ( Array.isArray( defaultConfig ) ) {
		const [ scriptConfig, moduleConfig ] = defaultConfig;

		const extendedScriptConfig = extendSharedConfig(
			extendScriptConfig( scriptConfig )
		);
		const extendedModuleConfig = extendSharedConfig(
			extendModuleConfig( moduleConfig )
		);

		return [ extendedScriptConfig, extendedModuleConfig ];
	}
	return extendSharedConfig( extendScriptConfig( defaultConfig ) );
} )();