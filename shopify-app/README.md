# CommentMind Shopify App

This directory contains the Theme App Extension used by the CommentMind Shopify app.

## Before deploying

1. Create a public app in the Shopify Dev Dashboard and set its app URL to `https://commentmind.website`.
2. Set the allowed redirect URL to `https://api.commentmind.website/api/v1/sites/shopify/callback`.
3. Add the client ID and client secret to `backend/.env` on the VPS.
4. Create the Shopify CLI app project, then copy `extensions/commentmind-theme` into its `extensions` directory.
5. Deploy with Shopify CLI and install the app on a development store before submitting it for review.

The app block intentionally accepts a CommentMind site key from the merchant. That key is generated in the CommentMind dashboard and is scoped to one website.
