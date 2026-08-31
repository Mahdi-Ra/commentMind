<?php
defined('ABSPATH') || exit;

class CMMIND_Admin {

    public static function init(): void {
        add_action('admin_menu',       [__CLASS__, 'register_menu']);
        add_action('admin_init',       [__CLASS__, 'register_settings']);
        add_action('admin_enqueue_scripts', [__CLASS__, 'enqueue_assets']);
    }

    public static function register_menu(): void {
        add_menu_page(
            'CommentMind AI',
            'CommentMind AI',
            'manage_options',
            'commentmind-ai',
            [__CLASS__, 'render_settings_page'],
            'dashicons-format-chat',
            58
        );
    }

    public static function register_settings(): void {
        register_setting('cmmind_settings_group', 'cmmind_settings', [
            'sanitize_callback' => [__CLASS__, 'sanitize_settings'],
        ]);
    }

    public static function sanitize_settings(array $input): array {
        $clean = [];
        $clean['api_key']       = sanitize_text_field($input['api_key'] ?? '');
        $clean['api_url']       = esc_url_raw($input['api_url'] ?? 'https://api.commentmind.website');
        $clean['auto_reply']    = ! empty($input['auto_reply']);
        $clean['auto_approve']  = ! empty($input['auto_approve']);
        $clean['auto_spam']     = ! empty($input['auto_spam']);
        $clean['reply_as_user'] = absint($input['reply_as_user'] ?? 0);
        $clean['tone']          = in_array($input['tone'] ?? '', ['friendly', 'formal', 'professional'])
                                  ? $input['tone'] : 'friendly';
        $clean['language']      = in_array($input['language'] ?? '', ['en', 'fa', 'ar', 'tr', 'de'])
                                  ? $input['language'] : 'en';
        return $clean;
    }

    public static function enqueue_assets(string $hook): void {
        if ($hook !== 'toplevel_page_commentmind-ai') {
            return;
        }
        wp_enqueue_style('cmmind-admin', CMMIND_PLUGIN_URL . 'assets/admin.css', [], CMMIND_VERSION);
    }

    public static function render_settings_page(): void {
        $settings = CMMIND_Settings::instance();
        $users    = get_users(['role__in' => ['administrator', 'editor']]);
        ?>
        <div class="wrap cm-wrap">
            <h1>🧠 CommentMind AI</h1>
            <p class="cm-subtitle">AI-powered comment moderation for your website.</p>

            <form method="post" action="options.php">
                <?php settings_fields('cmmind_settings_group'); ?>

                <div class="cm-card">
                    <h2>🔑 Connection settings</h2>
                    <table class="form-table">
                        <tr>
                            <th>API Key</th>
                            <td>
                                <input type="password" name="cmmind_settings[api_key]"
                                       value="<?php echo esc_attr($settings->get('api_key')); ?>"
                                       class="regular-text" placeholder="cm_..." />
                                <p class="description">Get your site API key from the CommentMind dashboard.</p>
                            </td>
                        </tr>
                        <tr>
                            <th>API URL</th>
                            <td>
                                <input type="url" name="cmmind_settings[api_url]"
                                       value="<?php echo esc_attr($settings->get('api_url')); ?>"
                                       class="regular-text" />
                            </td>
                        </tr>
                    </table>
                </div>

                <div class="cm-card">
                    <h2>🤖 AI settings</h2>
                    <table class="form-table">
                        <tr>
                            <th>Reply tone</th>
                            <td>
                                <select name="cmmind_settings[tone]">
                                    <?php
                                    $tones = ['friendly' => 'Friendly', 'formal' => 'Formal', 'professional' => 'Professional'];
                                    foreach ($tones as $val => $label) {
                                        printf(
                                            '<option value="%s" %s>%s</option>',
                                            esc_attr($val),
                                            selected($settings->get('tone'), $val, false),
                                            esc_html($label)
                                        );
                                    }
                                    ?>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th>Reply language</th>
                            <td>
                                <select name="cmmind_settings[language]">
                                    <?php
                                    $languages = [
                                        'en' => 'English',
                                        'fa' => 'Persian',
                                        'ar' => 'Arabic',
                                        'tr' => 'Turkish',
                                        'de' => 'German',
                                    ];
                                    foreach ($languages as $val => $label) {
                                        printf(
                                            '<option value="%s" %s>%s</option>',
                                            esc_attr($val),
                                            selected($settings->get('language'), $val, false),
                                            esc_html($label)
                                        );
                                    }
                                    ?>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th>Reply author</th>
                            <td>
                                <select name="cmmind_settings[reply_as_user]">
                                    <option value="0">Support (default)</option>
                                    <?php foreach ($users as $user) : ?>
                                        <option value="<?php echo esc_attr($user->ID); ?>"
                                            <?php echo selected($settings->get('reply_as_user'), $user->ID, false); ?>>
                                            <?php echo esc_html($user->display_name); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </td>
                        </tr>
                    </table>
                </div>

                <div class="cm-card">
                    <h2>⚙️ Moderation settings</h2>
                    <table class="form-table">
                        <tr>
                            <th>Auto-reply</th>
                            <td>
                                <label>
                                    <input type="checkbox" name="cmmind_settings[auto_reply]"
                                           value="1" <?php echo checked($settings->get('auto_reply'), true, false); ?> />
                                    Send AI replies to comments
                                </label>
                            </td>
                        </tr>
                        <tr>
                            <th>Auto-approve</th>
                            <td>
                                <label>
                                    <input type="checkbox" name="cmmind_settings[auto_approve]"
                                           value="1" <?php echo checked($settings->get('auto_approve'), true, false); ?> />
                                    Publish valid comments without manual approval
                                </label>
                            </td>
                        </tr>
                        <tr>
                            <th>Spam filter</th>
                            <td>
                                <label>
                                    <input type="checkbox" name="cmmind_settings[auto_spam]"
                                           value="1" <?php echo checked($settings->get('auto_spam'), true, false); ?> />
                                    Automatically mark spam comments
                                </label>
                            </td>
                        </tr>
                    </table>
                </div>

                <?php submit_button('Save settings'); ?>
            </form>

            <?php if ($settings->get('api_key')) : ?>
            <div class="cm-card cm-status">
                <h2>📊 Status</h2>
                <p>✅ The plugin is active and comments are being processed.</p>
            </div>
            <?php endif; ?>
        </div>
        <?php
    }
}
