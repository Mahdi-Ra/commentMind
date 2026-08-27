<!doctype html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<header class="cm-site-header">
  <div class="cm-container cm-header-inner">
    <a class="cm-brand" href="<?php echo esc_url(home_url('/')); ?>" aria-label="CommentMind Blog home">
      <span class="cm-brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/></svg></span>
      <span>Comment<span class="cm-brand-accent">Mind</span> Blog</span>
    </a>
    <nav class="cm-nav" aria-label="Primary navigation">
      <a href="<?php echo esc_url(home_url('/')); ?>">Articles</a>
      <a href="https://commentmind.website/wordpress/">WordPress</a>
      <a href="https://commentmind.website/#pricing">Pricing</a>
      <a class="cm-header-cta" href="https://commentmind.website/auth">Try it free</a>
    </nav>
  </div>
</header>
