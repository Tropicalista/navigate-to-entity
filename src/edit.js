/**
 * WordPress dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import {
	useEntityBlockEditor,
	useEntityRecord,
	store as coreStore,
} from '@wordpress/core-data';
import {
	Placeholder,
	Spinner,
	Button,
	Modal,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	ToolbarGroup,
	ToolbarButton,
	TextControl,
	PanelBody,
	SelectControl,
	Disabled,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import {
	useInnerBlocksProps,
	RecursionProvider,
	useHasRecursion,
	InnerBlocks,
	BlockControls,
	InspectorControls,
	useBlockProps,
	Warning,
	store as blockEditorStore,
} from '@wordpress/block-editor';

import { useState, useCallback, Fragment } from '@wordpress/element';

const NOOP = () => {};

export default function ReusableBlockEdit( {
	attributes: { ref, postType },
	clientId,
	name,
	setAttributes,
} ) {
	const { record, hasResolved } = useEntityRecord(
		'postType',
		postType,
		ref
	);

	const [ blocks ] = useEntityBlockEditor( 'postType', postType, {
		id: ref,
	} );
	const isMissing = hasResolved && ! record;

	const { onNavigateToEntityRecord } = useSelect(
		( select ) => {
			const {
				getSettings,
			} = select( blockEditorStore );

			// For editing link to the site editor if the theme and user permissions support it.
			return {
				onNavigateToEntityRecord:
					getSettings().onNavigateToEntityRecord,
			};
		},
		[ clientId, ref ]
	);

	const handleEditOriginal = () => {
		onNavigateToEntityRecord( {
			postId: ref,
			postType: postType,
		} );
	};

	const blockProps = useBlockProps();

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		templateLock: 'all',
		value: blocks,
		onInput: NOOP,
		onChange: NOOP,
	} );

	let children = null;

	if ( isMissing ) {
		children = (
			<Warning>
				{ __( 'Block has been deleted or is unavailable.' ) }
			</Warning>
		);
	}

	if ( ! hasResolved ) {
		children = (
			<Placeholder>
				<Spinner />
			</Placeholder>
		);
	}

	return (
		<div>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton onClick={ handleEditOriginal }>
						{ sprintf( 'Edit %s', postType ) }
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>
			{ children === null ? (
				<div { ...innerBlocksProps } />
			) : (
				<div { ...blockProps }>{ children }</div>
			) }
		</div>
	);
}
