<?php
defined('ABSPATH') || exit;

class CMMIND_Moderator {

    private CMMIND_Settings $settings;
    private CMMIND_API      $api;
    private array $pending_replies = [];

    public function __construct(CMMIND_Settings $settings) {
        $this->settings = $settings;
        $this->api = new CMMIND_API(
            $settings->get('api_key'),
            $settings->get('api_url')
        );

        // Hook to post the AI reply after comment is saved
        add_action('comment_post', [$this, 'post_ai_reply'], 20, 2);
    }

    /**
     * Called via preprocess_comment filter — runs BEFORE comment is saved.
     * The reply is kept in memory for the current comment-submission request.
     * This avoids cross-request transient collisions for identical comments.
     */
    public function handle_new_comment(array $commentdata): array {
        // Skip trackbacks/pingbacks
        if (in_array($commentdata['comment_type'] ?? '', ['trackback', 'pingback'], true)) {
            return $commentdata;
        }

        $result = $this->api->analyze_comment($commentdata);

        if (is_wp_error($result)) {
            // Log and let WP handle it normally on API failure
            error_log('[CommentMind] API error: ' . $result->get_error_message());
            return $commentdata;
        }

        $status     = $result['status']    ?? 'approved';
        $ai_reply   = $result['ai_reply']  ?? null;
        $spam_score = $result['spam_score'] ?? 0;

        // Mark as spam
        if ($status === 'spam' && $this->settings->get('auto_spam')) {
            $commentdata['comment_approved'] = 'spam';
            return $commentdata;
        }

        // Auto-approve
        if (in_array($status, ['approved', 'replied'], true) && $this->settings->get('auto_approve')) {
            $commentdata['comment_approved'] = 1;
        }

        // Save the reply for comment_post, which runs in this same request after insert.
        if ($ai_reply && $this->settings->get('auto_reply')) {
            $this->pending_replies[$this->comment_fingerprint($commentdata)] = $ai_reply;
        }

        return $commentdata;
    }

    /**
     * Called via comment_post action — comment is now saved with its ID.
     * Post the AI reply as a child comment.
     */
    public function post_ai_reply(int $comment_id, $comment_approved): void {
        if (! $this->settings->get('auto_reply')) {
            return;
        }

        $comment = get_comment($comment_id);
        if (! $comment) {
            return;
        }

        $fingerprint = $this->comment_fingerprint((array) $comment);
        $ai_reply = $this->pending_replies[$fingerprint] ?? null;
        unset($this->pending_replies[$fingerprint]);

        if (! $ai_reply) {
            return;
        }

        // Determine who posts the reply
        $reply_user_id = (int) $this->settings->get('reply_as_user');
        $reply_author  = 'Support';
        $reply_email   = get_bloginfo('admin_email');

        if ($reply_user_id) {
            $user = get_user_by('id', $reply_user_id);
            if ($user) {
                $reply_author = $user->display_name;
                $reply_email  = $user->user_email;
            }
        }

        wp_insert_comment([
            'comment_post_ID'      => $comment->comment_post_ID,
            'comment_parent'       => $comment_id,
            'comment_author'       => $reply_author,
            'comment_author_email' => $reply_email,
            'comment_content'      => $ai_reply,
            'comment_approved'     => 1,
            'user_id'              => $reply_user_id,
        ]);
    }

    private function comment_fingerprint(array $commentdata): string {
        return hash('sha256', implode('|', [
            (string) ($commentdata['comment_post_ID'] ?? ''),
            (string) ($commentdata['comment_content'] ?? ''),
            (string) ($commentdata['comment_author_email'] ?? ''),
        ]));
    }
}
