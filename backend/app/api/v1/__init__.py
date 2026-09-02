from fastapi import APIRouter
from app.api.v1 import admin, auth, sites, comments, knowledge, widget, billing, search_console, shopify

router = APIRouter(prefix="/api/v1")
router.include_router(auth.router)
router.include_router(admin.router)
router.include_router(sites.router)
router.include_router(comments.router)
router.include_router(knowledge.router)
router.include_router(widget.router)
router.include_router(billing.router)
router.include_router(search_console.router)
router.include_router(shopify.router)
