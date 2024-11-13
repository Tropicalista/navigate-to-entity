import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { getTopicsElementsFormat } from './utils';
import { useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useEntityRecords } from '@wordpress/core-data';
import './style.scss';
import { decodeEntities } from '@wordpress/html-entities';
import { dateI18n, getDate, getSettings } from '@wordpress/date';

// source "data" definition
import { dataPhotos } from './data';

// "defaultLayouts" definition
const primaryField = 'id';
const mediaField = 'img_src';
const DEFAULT_STATUSES = 'draft, future, pending, private, publish'; // All but 'trash'.
const STATUSES = [
	{ value: 'draft', label: __( 'Draft' ) },
	{ value: 'future', label: __( 'Scheduled' ) },
	{ value: 'pending', label: __( 'Pending Review' ) },
	{ value: 'private', label: __( 'Private' ) },
	{ value: 'publish', label: __( 'Published' ) },
	{ value: 'trash', label: __( 'Trash' ) },
];
const defaultLayouts = {
	table: {
		layout: {
			primaryField,
		},
	},
	grid: {
		layout: {
			primaryField,
			mediaField,
		},
	},
};

const App = () => {
	// "view" and "setView" definition
	const [ view, setView ] = useState( {
		type: 'table',
		perPage: 5,
		layout: defaultLayouts.table.layout,
		fields: [
			'title',
			'excerpt',
			'entries',
			'author',
			'status',
			'date',
		],
	} );

	const {
		records: forms,
		isResolving: isLoadingForms,
		totalItems,
		totalPages,
	} = useEntityRecords( 'postType', 'formello_form', { per_page: -1 } );

	const { records: authors, isResolving: isLoadingAuthors } =
		useEntityRecords( 'root', 'user', { per_page: -1 } );

	const fields = useMemo(
		() => [
			{
				header: __( 'Title' ),
				id: 'title',
				label: __( 'Title' ),
				getValue: ( { item } ) => item.title?.rendered,
				render: ( { item } ) => {
					return (
						<div>
							<Button
								variant="link"
								onClick={ ( e ) => {
									e.stopPropagation();
									const href = addQueryArgs( 'post.php', {
										post: item.id,
										action: 'edit',
									} );
									document.location.href = href;
								} }
							>
								{ decodeEntities(
									item.title?.rendered || item.slug
								) || __( '(no title)' ) }
							</Button>
						</div>
					);
				},
				enableGlobalSearch: true,
				enableHiding: false,
			},
			{
				header: __( 'Excerpt' ),
				label: __( 'Excerpt' ),
				id: 'excerpt',
				getValue: ( { item } ) => item.excerpt.raw,
			},
			{
				header: __( 'Entries' ),
				id: 'entries',
				render: ( { item } ) => {
					return (
						<div>
							<Button
								variant="link"
								onClick={ ( e ) => {
									e.stopPropagation();
								} }
							>
								{ item.submissions_count.total }
								{ item.submissions_count.news > 0 && (
									<span className="formello-badge">
										{ item.submissions_count.news }
									</span>
								) }
							</Button>
						</div>
					);
				},
			},
			{
				header: __( 'Author' ),
				id: 'author',
				getValue: ( { item } ) => item._embedded?.author[ 0 ]?.name,
				elements:
					authors?.map( ( { id, name } ) => ( {
						value: id,
						label: name,
					} ) ) || [],
			},
			{
				header: __( 'Status' ),
				id: 'status',
				elements: STATUSES,
				filterBy: {
					operators: [ 'isAny', 'isNone', 'isAll', 'isNotAll' ],
				},
			},
			{
				header: __( 'Date' ),
				id: 'date',
				render: ( { item } ) => {
					const formattedDate = dateI18n(
						getSettings().formats.datetimeAbbreviated,
						getDate( item.date )
					);
					return <time>{ formattedDate }</time>;
				},
			},
			{
				header: 'Shortcode',
				id: 'shortcode',
				render: ( { item } ) => {
					return <code>{ `[formello ref=${ item.id }]` }</code>;
				},
				enableSorting: false,
			},
		],
		[ authors, forms ]
	);

	// "processedData" and "paginationInfo" definition
	const { data: processedData, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( forms, view, fields );
	}, [ view, forms ] );

	// "actions" definition
	const actions = [
		{
			id: 'see-original',
			label: __( 'See Original' ),
			callback: ( [ item ] ) => {
				const urlImage = item.urls.raw;
				window.open( urlImage, '_blank' );
			},
		},
	];
	return (
		<DataViews
			data={ processedData }
			fields={ fields }
			view={ view }
			onChangeView={ setView }
			defaultLayouts={ defaultLayouts }
			actions={ actions }
			paginationInfo={ paginationInfo }
			isLoading={ isLoadingForms || isLoadingAuthors }
		/>
	);
};

export default App;