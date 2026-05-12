<?php
defined('ABSPATH') || exit;

class CM_Moderator {

    private CM_Settings $settings;
    private CM_API      $api;

    public function __construct(CM_Settings $settings) {
        $this->settings = $settings;
        $this->api = new CM_API(
            $settings->get('api_key'),
            $settings->get('api_url')
        );

        // Hook to post the AI reply after comment is saved
        add_action('comment_post', [$this, 'post_ai_reply'], 20, 2);
    }

    /**
     * Called via preprocess_comment filter — runs BEFORE comment is saved.
     * We store analysis result in a transient, keyed by a session hash.
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

        // Store reply in session transient (comment not saved yet, no ID)
        if ($ai_reply && $this->settings->get('auto_reply')) {
            $session_key = 'cm_reply_' . md5($commentdata['comment_content'] . $commentdata['comment_author_email']);
            set_transient($session_key, [
                'reply'      => $ai_reply,
                'post_id'    => $commentdata['comment_post_ID'],
                'session_key'=> $session_key,
            ], 120); // 2 min TTL

            // Pass session key through commentdata so we can pick it up in comment_post hook
            $commentdata['cm_session_key'] = $session_key;
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

        $session_key = 'cm_reply_' . md5($comment->comment_content . $comment->comment_author_email);
        $data = get_transient($session_key);

        if (! $data || empty($data['reply'])) {
            return;
        }

        delete_transient($session_key);

        // Determine who posts the reply
        $reply_user_id = (int) $this->settings->get('reply_as_user');
        $reply_author  = 'پشتیبانی';
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
            'comment_content'      => $data['reply'],
            'comment_approved'     => 1,
            'user_id'              => $reply_user_id,
        ]);
    }
}
