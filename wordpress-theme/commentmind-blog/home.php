<?php get_header(); ?>
<main>
  <section class="cm-hero"><div class="cm-container"><p class="cm-eyebrow">CommentMind resources</p><h1>Better conversations start with better comments.</h1><p>Practical guides on AI comment moderation, spam prevention, WordPress, and turning visitor questions into useful customer conversations.</p></div></section>
  <div class="cm-container">
    <?php if (have_posts()) : ?><section class="cm-post-grid" aria-label="Latest articles"><?php while (have_posts()) : the_post(); get_template_part('template-parts/post-card'); endwhile; ?></section><?php the_posts_pagination(array('mid_size' => 1, 'prev_text' => 'Previous', 'next_text' => 'Next')); ?><?php else : ?><section class="cm-empty"><h2>No articles yet</h2><p>New resources are on the way.</p></section><?php endif; ?>
  </div>
</main>
<?php get_footer(); ?>
