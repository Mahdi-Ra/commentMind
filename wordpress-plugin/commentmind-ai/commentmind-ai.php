<?php
/**
 * Plugin Name: CommentMind AI
 * Plugin URI:  https://commentmind.website
 * Description: AI-powered comment moderation, replies, approval, and spam filtering.
 * Version:     1.0.1
 * Author:      CommentMind
 * License:     GPL v2
 * Text Domain: commentmind-ai
 */

defined('ABSPATH') || exit;

define('CM_VERSION',    '1.0.1');
define('CM_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('CM_PLUGIN_URL', plugin_dir_url(__FILE__));

// Load modules
require_once CM_PLUGIN_DIR . 'includes/class-cm-api.php';
require_once CM_PLUGIN_DIR . 'includes/class-cm-moderator.php';
require_once CM_PLUGIN_DIR . 'includes/class-cm-settings.php';
require_once CM_PLUGIN_DIR . 'admin/class-cm-admin.php';

// Boot
add_action('plugins_loaded', ['CommentMind_AI', 'init']);

class CommentMind_AI {

    public static function init(): void {
        $settings = CM_Settings::instance();

        // The admin settings page must always be available so new installs can be configured.
        if (is_admin()) {
            CM_Admin::init();
        }

        // Only run moderation hooks after the plugin has an API key.
        if (! $settings->get('api_key')) {
            return;
        }

        $moderator = new CM_Moderator($settings);

        // Hook: new comment inserted (before status saved)
        add_filter('preprocess_comment', [$moderator, 'handle_new_comment'], 10, 1);
    }

    public static function activate(): void {
        // Nothing special needed
    }

    public static function deactivate(): void {}
}

register_activation_hook(__FILE__,   ['CommentMind_AI', 'activate']);
register_deactivation_hook(__FILE__, ['CommentMind_AI', 'deactivate']);
