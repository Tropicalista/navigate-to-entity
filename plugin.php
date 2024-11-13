<?php
/*
Plugin Name: Test Navigate To Entity
*/

add_action(
    'init',
    function () {
        register_post_type(
            'book',
            array(
                'public'              => true,
                'publicly_queryable'  => true,
                'capability_type'     => 'post',
                'has_archive'         => true,
                'show_ui'             => true,
                'menu_icon'           => 'dashicons-feedback',
                'exclude_from_search' => true,
                'show_in_nav_menus'   => true,
                'rewrite'             => true,
                'hierarchical'        => false,
                'show_in_menu'        => true,
                'show_in_admin_bar'   => true,
                'label'        => 'Books',
                'supports'            => array(
                    'author',
                    'title',
                    'editor',
                    'excerpt',
                    'custom-fields',
                    'revisions',
                ),
                'show_in_rest' => true,
            )
        );
    }
);

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function formello_test_block_init() {
    register_block_type( __DIR__ . '/build' );
}
add_action( 'init', 'formello_test_block_init' );

/**
 * Create two taxonomies, genres and writers for the post type "book".
 *
 * @see register_post_type() for registering custom post types.
 */
function wpdocs_create_book_taxonomies() {
    // Add new taxonomy, make it hierarchical (like categories)
    $labels = array(
        'name'              => _x( 'Genres', 'taxonomy general name', 'textdomain' ),
        'singular_name'     => _x( 'Genre', 'taxonomy singular name', 'textdomain' ),
        'search_items'      => __( 'Search Genres', 'textdomain' ),
        'all_items'         => __( 'All Genres', 'textdomain' ),
        'parent_item'       => __( 'Parent Genre', 'textdomain' ),
        'parent_item_colon' => __( 'Parent Genre:', 'textdomain' ),
        'edit_item'         => __( 'Edit Genre', 'textdomain' ),
        'update_item'       => __( 'Update Genre', 'textdomain' ),
        'add_new_item'      => __( 'Add New Genre', 'textdomain' ),
        'new_item_name'     => __( 'New Genre Name', 'textdomain' ),
        'menu_name'         => __( 'Genre', 'textdomain' ),
    );

    $args = array(
        'hierarchical'      => true,
        'labels'            => $labels,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array( 'slug' => 'genre' ),
        'show_in_rest'      => true,
    );

    register_taxonomy( 'genre', array( 'book' ), $args );

    unset( $args );
    unset( $labels );

    // Add new taxonomy, NOT hierarchical (like tags)
    $labels = array(
        'name'                       => _x( 'Writers', 'taxonomy general name', 'textdomain' ),
        'singular_name'              => _x( 'Writer', 'taxonomy singular name', 'textdomain' ),
        'search_items'               => __( 'Search Writers', 'textdomain' ),
        'popular_items'              => __( 'Popular Writers', 'textdomain' ),
        'all_items'                  => __( 'All Writers', 'textdomain' ),
        'parent_item'                => null,
        'parent_item_colon'          => null,
        'edit_item'                  => __( 'Edit Writer', 'textdomain' ),
        'update_item'                => __( 'Update Writer', 'textdomain' ),
        'add_new_item'               => __( 'Add New Writer', 'textdomain' ),
        'new_item_name'              => __( 'New Writer Name', 'textdomain' ),
        'separate_items_with_commas' => __( 'Separate writers with commas', 'textdomain' ),
        'add_or_remove_items'        => __( 'Add or remove writers', 'textdomain' ),
        'choose_from_most_used'      => __( 'Choose from the most used writers', 'textdomain' ),
        'not_found'                  => __( 'No writers found.', 'textdomain' ),
        'menu_name'                  => __( 'Writers', 'textdomain' ),
    );

    $args = array(
        'hierarchical'          => false,
        'labels'                => $labels,
        'show_ui'               => true,
        'show_admin_column'     => true,
        'update_count_callback' => '_update_post_term_count',
        'query_var'             => true,
        'rewrite'               => array( 'slug' => 'writer' ),
    );

    register_taxonomy( 'writer', 'book', $args );
}
// hook into the init action and call create_book_taxonomies when it fires
add_action( 'init', 'wpdocs_create_book_taxonomies', 0 );

/**
 * Creates a new Media subpage and set the HTML for it.
 */
function devblog_dataviews_admin_menu() {
    add_media_page(
        __( 'Add Media from third party service', 'devblog-dataviews-plugin' ),
        __( 'Add Media from third party service', 'devblog-dataviews-plugin' ),
        'manage_options',
        'add-media-from-third-party-service',
        function () {
            printf(
                '<h1>%s</h1><div id="add-media-from-third-party-service"></div>',
                esc_html__( 'Add Media from third party service', 'devblog-dataviews-plugin' )
            );
        }
    );
}
add_action( 'admin_menu', 'devblog_dataviews_admin_menu' );

add_action( 'admin_enqueue_scripts', 'devblog_dataviews_admin_enqueue_assets' );

/**
 * Enqueues JS and CSS files for our custom Media subsection page.
 *
 * @param string $hook_suffix The current admin page.
 */
function devblog_dataviews_admin_enqueue_assets( $hook_suffix ) {
    // Load only on ?page=add-media-from-third-party-service.
    if ( 'media_page_add-media-from-third-party-service' !== $hook_suffix ) {
        return;
    }

    $dir = plugin_dir_path( __FILE__ );
    $url = plugin_dir_url( __FILE__ );

    $asset_file = $dir . 'build/admin.asset.php';

    if ( ! file_exists( $asset_file ) ) {
        return;
    }

    $asset = include $asset_file;

    wp_enqueue_script(
        'devblog-dataviews-script',
        $url . 'build/admin.js',
        $asset['dependencies'],
        $asset['version'],
        array(
            'in_footer' => true,
        )
    );

    wp_enqueue_style(
        'devblog-dataviews-styles',
        $url . 'build/style-admin.css',
        array( 'wp-components' ),
        $asset['version'],
    );
    
}