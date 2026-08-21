# WordPress.org submission checklist

The distributable plugin is in `commentmind-ai/` and the matching customer download is generated at `dashboard/public/downloads/commentmind-ai-wordpress-plugin.zip`.

Before submitting:

1. Create or sign in to a WordPress.org account.
2. Replace `Contributors: commentmind` in `commentmind-ai/readme.txt` with the real WordPress.org username.
3. Run the official readme validator: https://wordpress.org/plugins/developers/readme-validator/
4. Submit the ZIP through https://wordpress.org/plugins/developers/add/.
5. Respond to the Plugin Review Team email and, after approval, commit releases to the provided SVN repository.

## Directory assets

After WordPress.org creates the SVN repository, add these optional but recommended raster assets in its `/assets` directory:

* `icon-128x128.png`
* `icon-256x256.png`
* `banner-772x250.png`
* `banner-1544x500.png`

Use the CommentMind wordmark and the product message "Automated comment moderation". Do not include pricing claims, third-party logos, or unreadably small text.

## External service disclosure

The plugin sends submitted comment data to `https://api.commentmind.website` to provide moderation and replies. This disclosure and links to the privacy policy and terms are included in `readme.txt`, which is required for review.
