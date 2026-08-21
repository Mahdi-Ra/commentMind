<?php
/**
 * Remove the plugin's WordPress option when the plugin is deleted.
 * Comment data remains in WordPress and CommentMind accounts remain untouched.
 */

defined('WP_UNINSTALL_PLUGIN') || exit;

delete_option('commentmind_settings');
