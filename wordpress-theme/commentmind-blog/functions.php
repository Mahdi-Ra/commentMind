<?php
if (!defined('ABSPATH')) {
    exit;
}

function cm_blog_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script'));
    add_theme_support('custom-logo', array('height' => 40, 'width' => 240, 'flex-width' => true, 'flex-height' => true));
    register_nav_menus(array('primary' => __('Primary menu', 'commentmind-blog')));
}
add_action('after_setup_theme', 'cm_blog_setup');

function cm_blog_enqueue_assets() {
    wp_enqueue_style('commentmind-blog', get_stylesheet_uri(), array(), '1.0.0');
}
add_action('wp_enqueue_scripts', 'cm_blog_enqueue_assets');

function cm_blog_read_time($post_id = null) {
    $content = get_post_field('post_content', $post_id);
    $words = str_word_count(wp_strip_all_tags($content));
    return max(1, (int) ceil($words / 220));
}

function cm_blog_heading_data($content) {
    $headings = array();
    $used_ids = array();

    preg_match_all('/<h([2-3])([^>]*)>(.*?)<\/h[2-3]>/is', $content, $matches, PREG_SET_ORDER);
    foreach ($matches as $match) {
        $level = (int) $match[1];
        $attributes = $match[2];
        $title = trim(wp_strip_all_tags($match[3]));
        if (!$title) {
            continue;
        }
        preg_match('/\sid=["\']([^"\']+)["\']/i', $attributes, $id_match);
        $base_id = !empty($id_match[1]) ? sanitize_title($id_match[1]) : sanitize_title($title);
        $id = $base_id ?: 'section';
        $suffix = 2;
        while (isset($used_ids[$id])) {
            $id = $base_id . '-' . $suffix;
            $suffix++;
        }
        $used_ids[$id] = true;
        $headings[] = array('level' => $level, 'title' => $title, 'id' => $id);
    }
    return $headings;
}

function cm_blog_add_heading_ids($content) {
    if (!is_singular('post') || !in_the_loop() || !is_main_query()) {
        return $content;
    }

    $headings = cm_blog_heading_data($content);
    $index = 0;
    return preg_replace_callback('/<h([2-3])([^>]*)>(.*?)<\/h[2-3]>/is', function ($match) use (&$headings, &$index) {
        if (!isset($headings[$index])) {
            return $match[0];
        }
        $heading = $headings[$index++];
        $attributes = preg_replace('/\sid=["\'][^"\']+["\']/i', '', $match[2]);
        return '<h' . $match[1] . $attributes . ' id="' . esc_attr($heading['id']) . '">' . $match[3] . '</h' . $match[1] . '>';
    }, $content);
}
add_filter('the_content', 'cm_blog_add_heading_ids', 20);

function cm_blog_get_toc($post_id) {
    return cm_blog_heading_data(get_post_field('post_content', $post_id));
}

function cm_blog_faq_meta_box() {
    add_meta_box('cm-blog-faq', __('Article FAQ', 'commentmind-blog'), 'cm_blog_faq_meta_box_html', 'post', 'normal', 'default');
}
add_action('add_meta_boxes', 'cm_blog_faq_meta_box');

function cm_blog_faq_meta_box_html($post) {
    wp_nonce_field('cm_blog_save_faq', 'cm_blog_faq_nonce');
    $faqs = get_post_meta($post->ID, '_cm_blog_faqs', true);
    $faqs = is_array($faqs) ? $faqs : array();
    ?>
    <p><?php esc_html_e('Add optional questions and answers for this article. They appear at the end of the post and generate FAQPage structured data.', 'commentmind-blog'); ?></p>
    <div id="cm-blog-faq-fields">
        <?php foreach ($faqs as $faq) : ?>
            <div class="cm-blog-faq-row" style="border:1px solid #dcdcde;margin:12px 0;padding:12px;">
                <p><label><strong><?php esc_html_e('Question', 'commentmind-blog'); ?></strong><br><input type="text" name="cm_blog_faq_question[]" value="<?php echo esc_attr($faq['question'] ?? ''); ?>" style="width:100%"></label></p>
                <p><label><strong><?php esc_html_e('Answer', 'commentmind-blog'); ?></strong><br><textarea name="cm_blog_faq_answer[]" rows="4" style="width:100%"><?php echo esc_textarea($faq['answer'] ?? ''); ?></textarea></label></p>
                <button type="button" class="button cm-blog-remove-faq"><?php esc_html_e('Remove', 'commentmind-blog'); ?></button>
            </div>
        <?php endforeach; ?>
    </div>
    <button type="button" class="button" id="cm-blog-add-faq"><?php esc_html_e('Add FAQ', 'commentmind-blog'); ?></button>
    <script>
    document.addEventListener('DOMContentLoaded', function () {
        var fields = document.getElementById('cm-blog-faq-fields');
        document.getElementById('cm-blog-add-faq').addEventListener('click', function () {
            var row = document.createElement('div');
            row.className = 'cm-blog-faq-row';
            row.style.cssText = 'border:1px solid #dcdcde;margin:12px 0;padding:12px;';
            row.innerHTML = '<p><label><strong>Question</strong><br><input type="text" name="cm_blog_faq_question[]" style="width:100%"></label></p><p><label><strong>Answer</strong><br><textarea name="cm_blog_faq_answer[]" rows="4" style="width:100%"></textarea></label></p><button type="button" class="button cm-blog-remove-faq">Remove</button>';
            fields.appendChild(row);
        });
        fields.addEventListener('click', function (event) { if (event.target.classList.contains('cm-blog-remove-faq')) event.target.closest('.cm-blog-faq-row').remove(); });
    });
    </script>
    <?php
}

function cm_blog_save_faq($post_id) {
    if (!isset($_POST['cm_blog_faq_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['cm_blog_faq_nonce'])), 'cm_blog_save_faq')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    $questions = isset($_POST['cm_blog_faq_question']) ? (array) wp_unslash($_POST['cm_blog_faq_question']) : array();
    $answers = isset($_POST['cm_blog_faq_answer']) ? (array) wp_unslash($_POST['cm_blog_faq_answer']) : array();
    $faqs = array();
    foreach ($questions as $index => $question) {
        $question = sanitize_text_field($question);
        $answer = isset($answers[$index]) ? wp_kses_post($answers[$index]) : '';
        if ($question && $answer) $faqs[] = array('question' => $question, 'answer' => $answer);
    }
    if ($faqs) update_post_meta($post_id, '_cm_blog_faqs', $faqs);
    else delete_post_meta($post_id, '_cm_blog_faqs');
}
add_action('save_post_post', 'cm_blog_save_faq');

function cm_blog_faq_schema() {
    if (!is_singular('post')) return;
    $faqs = get_post_meta(get_the_ID(), '_cm_blog_faqs', true);
    if (!is_array($faqs) || !$faqs) return;
    $items = array();
    foreach ($faqs as $faq) {
        if (empty($faq['question']) || empty($faq['answer'])) continue;
        $items[] = array('@type' => 'Question', 'name' => wp_strip_all_tags($faq['question']), 'acceptedAnswer' => array('@type' => 'Answer', 'text' => wp_strip_all_tags($faq['answer'])));
    }
    if ($items) echo '<script type="application/ld+json">' . wp_json_encode(array('@context' => 'https://schema.org', '@type' => 'FAQPage', 'mainEntity' => $items), JSON_UNESCAPED_SLASHES) . '</script>' . "\n";
}
add_action('wp_head', 'cm_blog_faq_schema');
