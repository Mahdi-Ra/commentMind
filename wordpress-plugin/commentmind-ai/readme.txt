=== CommentMind AI ===
Contributors: mahdirahani
Tags: comments, comment moderation, spam filter, ai replies, customer support
Requires at least: 6.0
Tested up to: 7.1
Requires PHP: 8.0
Stable tag: 1.1.3
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Moderate WordPress comments, filter spam, and publish helpful AI-assisted replies with CommentMind.

== Description ==

CommentMind AI connects your WordPress comments to your CommentMind account. It can identify spam, approve legitimate comments, and publish concise replies in your selected tone and language.

You need a free or paid CommentMind account to use this plugin. Create an account at https://commentmind.website and create a site to receive an API key.

= What it does =

* Sends new WordPress comments to CommentMind for moderation.
* Automatically marks high-confidence spam as spam.
* Approves legitimate comments when auto-approve is enabled.
* Posts AI-generated replies as child comments when auto-reply is enabled.
* Supports English, Persian, Arabic, Turkish, and German reply settings.
* Works with WooCommerce product comments and sends available product context to CommentMind.

== External services ==

This plugin requires the CommentMind API at https://api.commentmind.website to moderate comments and generate optional replies. When a visitor submits a new WordPress comment, the plugin sends the comment content, author name, author email, post title, and post URL to the API. For WooCommerce product comments, it can also send available product name, SKU, price, and stock status. This happens only after the site owner installs, activates, and configures the plugin with a CommentMind API key.

CommentMind provides the moderation and reply service. Its terms and privacy policy are available at:

* https://commentmind.website/terms
* https://commentmind.website/privacy

== Installation ==

1. Install and activate CommentMind AI through the WordPress Plugins screen.
2. Create a site in your CommentMind dashboard at https://commentmind.website/dashboard.
3. Copy that site's API key.
4. Go to **CommentMind AI** in the WordPress admin menu.
5. Paste the API key, choose your settings, and save.

== Frequently Asked Questions ==

= Do I need a CommentMind account? =

Yes. The plugin uses your CommentMind API key to securely connect your WordPress site to the moderation service.

= Can I review comments manually? =

Yes. Disable Auto-approve or Auto-reply in the plugin settings or in your CommentMind site settings. Comments and suggested replies remain visible in the CommentMind dashboard.

= Does the plugin work with WooCommerce? =

Yes. When a comment is attached to a WooCommerce product, available product name, price, stock status, and SKU are sent as context for more relevant replies.

= What happens when I delete the plugin? =

The plugin removes its local settings. Existing WordPress comments are not deleted, and your CommentMind account remains available.

== Changelog ==

= 1.1.3 =
* Fixed the admin layout direction so English WordPress dashboards remain LTR while RTL WordPress locales remain RTL.

= 1.1.2 =
* Added unique CMMIND prefixes for plugin declarations and stored settings.
* Improved external service disclosure.
* Removed legacy translation loading for WordPress.org.
* Prevented reply matching collisions during concurrent comment submissions.

= 1.1.1 =
* Fixed WordPress.org compatibility checks for PHP output tags.
* Updated the tested WordPress version metadata.

= 1.1.0 =
* Prepared the plugin package for WordPress.org distribution.
* Added standard plugin documentation and uninstall cleanup.
* Added WordPress and PHP compatibility metadata.

= 1.0.1 =
* Fixed the admin settings menu for new installations.

== Upgrade Notice ==

= 1.1.2 =
Improves WordPress.org compatibility, service disclosure, and concurrent comment handling.

= 1.1.1 =
Improves WordPress.org compatibility metadata and admin output compatibility.

= 1.1.0 =
Adds WordPress.org-ready documentation and standard cleanup on uninstall.
