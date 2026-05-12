<?php
defined('ABSPATH') || exit;

class CM_Admin {

    public static function init(): void {
        add_action('admin_menu',       [__CLASS__, 'register_menu']);
        add_action('admin_init',       [__CLASS__, 'register_settings']);
        add_action('admin_enqueue_scripts', [__CLASS__, 'enqueue_assets']);
    }

    public static function register_menu(): void {
        add_options_page(
            'CommentMind AI',
            'CommentMind AI',
            'manage_options',
            'commentmind-ai',
            [__CLASS__, 'render_settings_page']
        );
    }

    public static function register_settings(): void {
        register_setting('commentmind_settings_group', 'commentmind_settings', [
            'sanitize_callback' => [__CLASS__, 'sanitize_settings'],
        ]);
    }

    public static function sanitize_settings(array $input): array {
        $clean = [];
        $clean['api_key']       = sanitize_text_field($input['api_key'] ?? '');
        $clean['api_url']       = esc_url_raw($input['api_url'] ?? 'https://api.commentmind.ai');
        $clean['auto_reply']    = ! empty($input['auto_reply']);
        $clean['auto_approve']  = ! empty($input['auto_approve']);
        $clean['auto_spam']     = ! empty($input['auto_spam']);
        $clean['reply_as_user'] = absint($input['reply_as_user'] ?? 0);
        $clean['tone']          = in_array($input['tone'] ?? '', ['friendly', 'formal', 'professional'])
                                  ? $input['tone'] : 'friendly';
        $clean['language']      = in_array($input['language'] ?? '', ['fa', 'en'])
                                  ? $input['language'] : 'fa';
        return $clean;
    }

    public static function enqueue_assets(string $hook): void {
        if ($hook !== 'settings_page_commentmind-ai') {
            return;
        }
        wp_enqueue_style('cm-admin', CM_PLUGIN_URL . 'assets/admin.css', [], CM_VERSION);
    }

    public static function render_settings_page(): void {
        $settings = CM_Settings::instance();
        $users    = get_users(['role__in' => ['administrator', 'editor']]);
        ?>
        <div class="wrap cm-wrap">
            <h1>🧠 CommentMind AI</h1>
            <p class="cm-subtitle">هوش مصنوعی برای مدیریت خودکار کامنت‌های سایت شما</p>

            <form method="post" action="options.php">
                <?php settings_fields('commentmind_settings_group'); ?>

                <div class="cm-card">
                    <h2>🔑 تنظیمات اتصال</h2>
                    <table class="form-table">
                        <tr>
                            <th>API Key</th>
                            <td>
                                <input type="password" name="commentmind_settings[api_key]"
                                       value="<?= esc_attr($settings->get('api_key')); ?>"
                                       class="regular-text" placeholder="cm_..." />
                                <p class="description">کلید API سایت خود را از داشبورد CommentMind دریافت کنید.</p>
                            </td>
                        </tr>
                        <tr>
                            <th>آدرس API</th>
                            <td>
                                <input type="url" name="commentmind_settings[api_url]"
                                       value="<?= esc_attr($settings->get('api_url')); ?>"
                                       class="regular-text" />
                            </td>
                        </tr>
                    </table>
                </div>

                <div class="cm-card">
                    <h2>🤖 تنظیمات هوش مصنوعی</h2>
                    <table class="form-table">
                        <tr>
                            <th>لحن جواب‌ها</th>
                            <td>
                                <select name="commentmind_settings[tone]">
                                    <?php
                                    $tones = ['friendly' => 'دوستانه', 'formal' => 'رسمی', 'professional' => 'حرفه‌ای'];
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
                            <th>زبان پاسخ</th>
                            <td>
                                <select name="commentmind_settings[language]">
                                    <option value="fa" <?= selected($settings->get('language'), 'fa', false); ?>>فارسی</option>
                                    <option value="en" <?= selected($settings->get('language'), 'en', false); ?>>English</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th>پاسخ‌دهنده</th>
                            <td>
                                <select name="commentmind_settings[reply_as_user]">
                                    <option value="0">پشتیبانی (پیش‌فرض)</option>
                                    <?php foreach ($users as $user) : ?>
                                        <option value="<?= esc_attr($user->ID); ?>"
                                            <?= selected($settings->get('reply_as_user'), $user->ID, false); ?>>
                                            <?= esc_html($user->display_name); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </td>
                        </tr>
                    </table>
                </div>

                <div class="cm-card">
                    <h2>⚙️ تنظیمات مدیریت</h2>
                    <table class="form-table">
                        <tr>
                            <th>پاسخ خودکار</th>
                            <td>
                                <label>
                                    <input type="checkbox" name="commentmind_settings[auto_reply]"
                                           value="1" <?= checked($settings->get('auto_reply'), true, false); ?> />
                                    جواب AI به کامنت‌ها ارسال شود
                                </label>
                            </td>
                        </tr>
                        <tr>
                            <th>تأیید خودکار</th>
                            <td>
                                <label>
                                    <input type="checkbox" name="commentmind_settings[auto_approve]"
                                           value="1" <?= checked($settings->get('auto_approve'), true, false); ?> />
                                    کامنت‌های معتبر بدون نیاز به تأیید ادمین نشر شوند
                                </label>
                            </td>
                        </tr>
                        <tr>
                            <th>فیلتر اسپم</th>
                            <td>
                                <label>
                                    <input type="checkbox" name="commentmind_settings[auto_spam]"
                                           value="1" <?= checked($settings->get('auto_spam'), true, false); ?> />
                                    کامنت‌های اسپم به‌صورت خودکار علامت‌گذاری شوند
                                </label>
                            </td>
                        </tr>
                    </table>
                </div>

                <?php submit_button('ذخیره تنظیمات'); ?>
            </form>

            <?php if ($settings->get('api_key')) : ?>
            <div class="cm-card cm-status">
                <h2>📊 وضعیت</h2>
                <p>✅ افزونه فعال است و کامنت‌ها پردازش می‌شوند.</p>
            </div>
            <?php endif; ?>
        </div>
        <?php
    }
}
