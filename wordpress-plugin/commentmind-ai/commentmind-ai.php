<?php
/**
 * Plugin Name: CommentMind AI
 * Plugin URI:  https://commentmind.website/wordpress/
 * Description: Moderate WordPress comments, filter spam, and publish AI-assisted replies through CommentMind.
 * Version:     1.1.4
 * Author:      CommentMind
 * Author URI:  https://commentmind.website/about/
 * Requires at least: 6.0
 * Requires PHP: 8.0
 * License:     GPL v2
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: commentmind-ai
 */

defined('ABSPATH') || exit;

define('CMMIND_VERSION', '1.1.4');
define('CMMIND_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('CMMIND_PLUGIN_URL', plugin_dir_url(__FILE__));

// Load modules
require_once CMMIND_PLUGIN_DIR . 'includes/class-cm-api.php';
require_once CMMIND_PLUGIN_DIR . 'includes/class-cm-moderator.php';
require_once CMMIND_PLUGIN_DIR . 'includes/class-cm-settings.php';
require_once CMMIND_PLUGIN_DIR . 'admin/class-cm-admin.php';

// Boot
add_action('plugins_loaded', ['CMMIND_Plugin', 'init']);

class CMMIND_Plugin {

    public static function init(): void {
        $settings = CMMIND_Settings::instance();

        // The admin settings page must always be available so new installs can be configured.
        if (is_admin()) {
            CMMIND_Admin::init();
        }

        // Only run moderation hooks after the plugin has an API key.
        if (! $settings->get('api_key')) {
            return;
        }

        $moderator = new CMMIND_Moderator($settings);

        // Hook: new comment inserted (before status saved)
        add_filter('preprocess_comment', [$moderator, 'handle_new_comment'], 10, 1);
    }

    public static function activate(): void {
        // Nothing special needed
    }

    public static function deactivate(): void {}
}

register_activation_hook(__FILE__, ['CMMIND_Plugin', 'activate']);
register_deactivation_hook(__FILE__, ['CMMIND_Plugin', 'deactivate']);
