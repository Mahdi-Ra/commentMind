<?php
defined('ABSPATH') || exit;

class CMMIND_Settings {

    private static ?CMMIND_Settings $instance = null;
    private array $options;
    private const OPTION_KEY = 'cmmind_settings';
    private const LEGACY_OPTION_KEY = 'commentmind_settings';

    private array $defaults = [
        'api_key'          => '',
        'api_url'          => 'https://api.commentmind.website',
        'auto_reply'       => true,
        'auto_approve'     => true,
        'auto_spam'        => true,
        'reply_as_user'    => '',   // WP user ID to post replies as
        'tone'             => 'friendly',
        'language'         => 'en',
    ];

    private function __construct() {
        $saved = get_option(self::OPTION_KEY, null);
        if (!is_array($saved)) {
            $saved = get_option(self::LEGACY_OPTION_KEY, []);
        }
        $this->options = array_merge($this->defaults, $saved);
    }

    public static function instance(): self {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function get(string $key, mixed $default = null): mixed {
        return $this->options[$key] ?? $default;
    }

    public function set(string $key, mixed $value): void {
        $this->options[$key] = $value;
    }

    public function save(): void {
        update_option(self::OPTION_KEY, $this->options);
    }

    public function all(): array {
        return $this->options;
    }
}
