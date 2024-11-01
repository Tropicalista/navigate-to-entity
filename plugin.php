<?php
/*
Plugin Name: Custom Query Vars
*/

add_action(
    'init',
    function () {
        register_post_type(
            'book',
            array(
                'public'              => false,
                'publicly_queryable'  => false,
                'capability_type'     => 'post',
                'has_archive'         => false,
                'show_ui'             => true,
                'menu_icon'           => 'dashicons-feedback',
                'exclude_from_search' => true,
                'show_in_nav_menus'   => true,
                'rewrite'             => false,
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