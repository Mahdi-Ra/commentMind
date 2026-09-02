/**
 * CommentMind AI — Universal embed widget
 * Usage: <div id="commentmind-root"></div><script src="..." data-api-key="cm_..." ...></script>
 */
(function () {
  'use strict';

  var script = document.currentScript;
  if (!script) {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.indexOf('widget.js') !== -1) {
        script = scripts[i];
        break;
      }
    }
  }

  var cfg = {
    apiKey: script && script.getAttribute('data-api-key'),
    apiUrl: (script && script.getAttribute('data-api-url')) || '',
    pageTitle: (script && script.getAttribute('data-page-title')) || document.title,
    pageUrl: (script && script.getAttribute('data-page-url')) || window.location.href,
    productSku: script && script.getAttribute('data-product-sku'),
    productPrice: script && script.getAttribute('data-product-price'),
    productStockStatus: script && script.getAttribute('data-product-stock-status'),
    productContext: script && script.getAttribute('data-product-context'),
    rootId: (script && script.getAttribute('data-root')) || 'commentmind-root',
  };

  if (!cfg.apiKey) {
    console.error('[CommentMind] Missing data-api-key on script tag');
    return;
  }

  cfg.apiUrl = cfg.apiUrl.replace(/\/$/, '');

  var i18n = {
    en: {
      title: 'Comments',
      placeholder: 'Write a comment…',
      name: 'Name',
      email: 'Email (optional)',
      submit: 'Post comment',
      submitting: 'Analyzing…',
      empty: 'No comments yet. Be the first!',
      spam: 'Your comment was flagged as spam.',
      review: 'Your comment is pending review.',
      approved: 'Comment posted successfully.',
      replied: 'Comment posted — AI replied below.',
      error: 'Something went wrong. Please try again.',
      aiReply: 'AI reply',
      powered: 'Powered by CommentMind AI',
    },
  };

  var state = {
    lang: 'en',
    t: i18n.en,
    config: null,
    comments: [],
    loading: true,
    submitting: false,
    message: null,
    messageType: null,
  };

  function api(path, options) {
    options = options || {};
    var headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + cfg.apiKey,
    };
    return fetch(cfg.apiUrl + '/api/v1/widget' + path, {
      method: options.method || 'GET',
      headers: headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          var err = new Error(data.detail || 'Request failed');
          err.status = res.status;
          throw err;
        }
        return data;
      });
    });
  }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleString();
    } catch (e) {
      return iso;
    }
  }

  var styles =
    ':host{--cm-bg:#fff;--cm-border:#e2e8f0;--cm-text:#0f172a;--cm-muted:#64748b;--cm-brand:#7c3aed;--cm-brand-light:#f5f3ff;--cm-danger:#fef2f2;--cm-danger-text:#b91c1c;--cm-success:#f0fdf4;--cm-success-text:#15803d;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:14px;line-height:1.5;color:var(--cm-text);display:block;box-sizing:border-box}' +
    '*,*::before,*::after{box-sizing:border-box}' +
    '.cm-wrap{max-width:720px;margin:0 auto}' +
    '.cm-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}' +
    '.cm-title{font-size:18px;font-weight:600;margin:0}' +
    '.cm-badge{font-size:11px;color:var(--cm-muted)}' +
    '.cm-list{display:flex;flex-direction:column;gap:12px;margin-bottom:20px}' +
    '.cm-card{background:var(--cm-bg);border:1px solid var(--cm-border);border-radius:12px;padding:14px 16px}' +
    '.cm-meta{display:flex;justify-content:space-between;gap:8px;margin-bottom:8px;font-size:12px;color:var(--cm-muted)}' +
    '.cm-author{font-weight:600;color:var(--cm-text)}' +
    '.cm-body{font-size:14px;white-space:pre-wrap;word-break:break-word}' +
    '.cm-reply{margin-top:10px;padding:10px 12px;background:var(--cm-brand-light);border-radius:8px;border-left:3px solid var(--cm-brand)}' +
    '.cm-reply-label{font-size:11px;font-weight:600;color:var(--cm-brand);margin-bottom:4px}' +
    '.cm-empty{text-align:center;padding:32px 16px;color:var(--cm-muted);border:1px dashed var(--cm-border);border-radius:12px}' +
    '.cm-form{background:var(--cm-bg);border:1px solid var(--cm-border);border-radius:12px;padding:16px}' +
    '.cm-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}' +
    '@media(max-width:480px){.cm-row{grid-template-columns:1fr}}' +
    '.cm-field{margin-bottom:10px}' +
    '.cm-label{display:block;font-size:12px;font-weight:500;margin-bottom:4px;color:var(--cm-muted)}' +
    '.cm-input,.cm-textarea{width:100%;padding:10px 12px;border:1px solid var(--cm-border);border-radius:8px;font:inherit;background:#fff;color:var(--cm-text)}' +
    '.cm-input:focus,.cm-textarea:focus{outline:none;border-color:var(--cm-brand);box-shadow:0 0 0 3px rgba(124,58,237,.15)}' +
    '.cm-textarea{min-height:88px;resize:vertical}' +
    '.cm-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 18px;background:var(--cm-brand);color:#fff;border:none;border-radius:8px;font:inherit;font-weight:600;cursor:pointer;transition:opacity .15s}' +
    '.cm-btn:hover{opacity:.92}' +
    '.cm-btn:disabled{opacity:.5;cursor:not-allowed}' +
    '.cm-alert{padding:10px 14px;border-radius:8px;margin-bottom:12px;font-size:13px}' +
    '.cm-alert-error{background:var(--cm-danger);color:var(--cm-danger-text)}' +
    '.cm-alert-success{background:var(--cm-success);color:var(--cm-success-text)}' +
    '.cm-alert-warn{background:#fffbeb;color:#b45309}' +
    '.cm-spinner{display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:cm-spin .6s linear infinite}' +
    '@keyframes cm-spin{to{transform:rotate(360deg)}}' +
    '.cm-skel{height:80px;border-radius:12px;background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200% 100%;animation:cm-shimmer 1.2s infinite}' +
    '@keyframes cm-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}';

  var hostEl, shadow, root;

  function getRoot() {
    var el = document.getElementById(cfg.rootId);
    if (!el) {
      el = document.createElement('div');
      el.id = cfg.rootId;
      if (script && script.parentNode) {
        script.parentNode.insertBefore(el, script);
      } else {
        document.body.appendChild(el);
      }
    }
    return el;
  }

  function render() {
    if (!shadow) return;
    var t = state.t;
    var html = '<div class="cm-wrap" dir="ltr">';

    html += '<div class="cm-header"><h3 class="cm-title">' + esc(t.title) + '</h3>';
    html += '<span class="cm-badge">' + esc(t.powered) + '</span></div>';

    if (state.message) {
      var cls =
        state.messageType === 'error'
          ? 'cm-alert-error'
          : state.messageType === 'warn'
            ? 'cm-alert-warn'
            : 'cm-alert-success';
      html += '<div class="cm-alert ' + cls + '">' + esc(state.message) + '</div>';
    }

    html += '<div class="cm-list">';
    if (state.loading) {
      html += '<div class="cm-skel"></div><div class="cm-skel"></div>';
    } else if (!state.comments.length) {
      html += '<div class="cm-empty">' + esc(t.empty) + '</div>';
    } else {
      state.comments.forEach(function (c) {
        html += '<article class="cm-card">';
        html += '<div class="cm-meta"><span class="cm-author">' + esc(c.author_name || 'Anonymous') + '</span>';
        html += '<time>' + esc(formatDate(c.created_at)) + '</time></div>';
        html += '<div class="cm-body">' + esc(c.content) + '</div>';
        if (c.ai_reply) {
          html += '<div class="cm-reply"><div class="cm-reply-label">' + esc(t.aiReply) + '</div>';
          html += '<div>' + esc(c.ai_reply) + '</div></div>';
        }
        html += '</article>';
      });
    }
    html += '</div>';

    html += '<form class="cm-form" id="cm-form">';
    html += '<div class="cm-row">';
    html += '<div class="cm-field"><label class="cm-label">' + esc(t.name) + '</label>';
    html += '<input class="cm-input" name="author_name" required maxlength="120" /></div>';
    html += '<div class="cm-field"><label class="cm-label">' + esc(t.email) + '</label>';
    html += '<input class="cm-input" type="email" name="author_email" maxlength="200" /></div>';
    html += '</div>';
    html += '<div class="cm-field"><label class="cm-label">' + esc(t.placeholder) + '</label>';
    html += '<textarea class="cm-textarea" name="content" required maxlength="5000"></textarea></div>';
    html += '<button type="submit" class="cm-btn" ' + (state.submitting ? 'disabled' : '') + '>';
    if (state.submitting) html += '<span class="cm-spinner"></span> ';
    html += esc(state.submitting ? t.submitting : t.submit) + '</button>';
    html += '</form></div>';

    root.innerHTML = html;

    var form = shadow.getElementById('cm-form');
    if (form) {
      form.onsubmit = onSubmit;
    }
  }

  function setMessage(text, type) {
    state.message = text;
    state.messageType = type;
    render();
  }

  function onSubmit(e) {
    e.preventDefault();
    if (state.submitting) return;

    var fd = new FormData(e.target);
    var content = (fd.get('content') || '').toString().trim();
    var author_name = (fd.get('author_name') || '').toString().trim();
    var author_email = (fd.get('author_email') || '').toString().trim();

    if (!content) return;

    state.submitting = true;
    state.message = null;
    render();

    api('/comment', {
      method: 'POST',
      body: {
        content: content,
        author_name: author_name || undefined,
        author_email: author_email || undefined,
        post_title: cfg.pageTitle,
        post_url: cfg.pageUrl,
        product_sku: cfg.productSku || undefined,
        product_price: cfg.productPrice || undefined,
        product_stock_status: cfg.productStockStatus || undefined,
        product_context: cfg.productContext || undefined,
      },
    })
      .then(function (result) {
        state.submitting = false;
        e.target.reset();

        if (result.status === 'spam') {
          setMessage(state.t.spam, 'warn');
        } else if (result.status === 'uncertain') {
          setMessage(state.t.review, 'warn');
        } else if (result.status === 'replied') {
          setMessage(state.t.replied, 'success');
        } else {
          setMessage(state.t.approved, 'success');
        }

        loadComments();
      })
      .catch(function (err) {
        state.submitting = false;
        setMessage(
          err.message || state.t.error,
          'error',
        );
      });
  }

  function loadComments() {
    return api(
      '/comments?post_url=' + encodeURIComponent(cfg.pageUrl) + '&limit=50',
    ).then(function (list) {
      state.comments = list;
      state.loading = false;
      render();
    });
  }

  function init() {
    hostEl = getRoot();
    hostEl.innerHTML = '';
    shadow = hostEl.attachShadow({ mode: 'open' });
    root = document.createElement('div');
    shadow.appendChild(root);

    var style = document.createElement('style');
    style.textContent = styles;
    shadow.appendChild(style);

    state.loading = true;
    render();

    api('/config')
      .then(function (config) {
        state.config = config;
        state.lang = 'en';
        state.t = i18n[state.lang] || i18n.en;
        return loadComments();
      })
      .catch(function (err) {
        state.loading = false;
        state.t = i18n.en;
        setMessage(err.message || state.t.error, 'error');
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CommentMind = {
    reload: loadComments,
    getConfig: function () {
      return state.config;
    },
  };
})();
