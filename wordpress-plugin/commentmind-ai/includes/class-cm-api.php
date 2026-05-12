<?php
defined('ABSPATH') || exit;

class CM_API {

    private string $api_key;
    private string $api_url;
    private int $timeout = 30;

    public function __construct(string $api_key, string $api_url) {
        $this->api_key = $api_key;
        $this->api_url = rtrim($api_url, '/');
    }

    /**
     * Submit a comment to CommentMind for analysis
     */
    public function analyze_comment(array $comment_data): array|WP_Error {
        $payload = [
            'external_id'  => (string) ($comment_data['comment_ID'] ?? ''),
            'author_name'  => $comment_data['comment_author'] ?? '',
            'author_email' => $comment_data['comment_author_email'] ?? '',
            'content'      => $comment_data['comment_content'] ?? '',
            'post_title'   => get_the_title($comment_data['comment_post_ID'] ?? 0),
            'post_url'     => get_permalink($comment_data['comment_post_ID'] ?? 0),
        ];

        $response = wp_remote_post(
            $this->api_url . '/api/v1/widget/comment',
            [
                'timeout'     => $this->timeout,
                'headers'     => [
                    'Content-Type'  => 'application/json',
                    'Authorization' => 'Bearer ' . $this->api_key,
                ],
                'body'        => wp_json_encode($payload),
                'data_format' => 'body',
            ]
        );

        if (is_wp_error($response)) {
            return $response;
        }

        $status_code = wp_remote_retrieve_response_code($response);
        $body        = wp_remote_retrieve_body($response);
        $data        = json_decode($body, true);

        if ($status_code !== 200 || ! is_array($data)) {
            return new WP_Error(
                'cm_api_error',
                sprintf('CommentMind API error %d: %s', $status_code, $body)
            );
        }

        return $data;
    }

    /**
     * Upload knowledge base content
     */
    public function add_knowledge(string $site_id, string $content, string $source = 'wordpress'): bool {
        $response = wp_remote_post(
            $this->api_url . '/api/v1/sites/' . $site_id . '/knowledge',
            [
                'timeout' => 30,
                'headers' => [
                    'Content-Type'  => 'application/json',
                    'Authorization' => 'Bearer ' . $this->api_key,
                ],
                'body' => wp_json_encode([
                    'content'     => $content,
                    'source_name' => $source,
                ]),
                'data_format' => 'body',
            ]
        );

        return ! is_wp_error($response) && wp_remote_retrieve_response_code($response) === 201;
    }
}
