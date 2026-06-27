from fastapi import APIRouter, BackgroundTasks, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.core.database import get_db
from app.models.knowledge import KnowledgeChunk
from app.models.user import User
from app.schemas.knowledge import KnowledgeAdd, KnowledgeOut
from app.services.site_service import get_site
from app.services.embedding_service import embed_chunk
from app.api.v1.deps import get_current_user

router = APIRouter(prefix="/sites/{site_id}/knowledge", tags=["Knowledge Base"])

CHUNK_SIZE = 1000  # characters per chunk


def _chunk_text(text: str, chunk_size: int = CHUNK_SIZE) -> list[str]:
    """Split text into chunks, respecting paragraph boundaries."""
    paragraphs = text.split("\n\n")
    chunks = []
    current = ""
    for para in paragraphs:
        if len(current) + len(para) > chunk_size and current:
            chunks.append(current.strip())
            current = para
        else:
            current += "\n\n" + para
    if current.strip():
        chunks.append(current.strip())
    return chunks


async def _embed_chunks_background(chunk_ids: list[str]) -> None:
    """Generate embeddings using a fresh session after the request is committed."""
    from app.core.database import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(KnowledgeChunk).where(KnowledgeChunk.id.in_(chunk_ids))
        )
        for chunk in result.scalars().all():
            await embed_chunk(db, chunk)
        await db.commit()


@router.post("", response_model=list[KnowledgeOut], status_code=201)
async def add_knowledge(
    site_id: str,
    background_tasks: BackgroundTasks,
    payload: KnowledgeAdd,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_site(db, site_id, current_user.id)
    chunks_text = _chunk_text(payload.content)
    chunks = []
    for i, chunk in enumerate(chunks_text):
        kc = KnowledgeChunk(
            site_id=site_id,
            source_name=payload.source_name,
            content=chunk,
            chunk_index=i,
        )
        db.add(kc)
        chunks.append(kc)
    await db.flush()
    chunk_ids = [chunk.id for chunk in chunks]
    await db.commit()
    # Generate embeddings in the background so the response is instant
    background_tasks.add_task(_embed_chunks_background, chunk_ids)
    return chunks


@router.post("/upload", response_model=list[KnowledgeOut], status_code=201)
async def upload_document(
    site_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    file: UploadFile = File(...),
):
    await get_site(db, site_id, current_user.id)

    content = await file.read()

    if file.content_type in ("text/plain", "text/markdown"):
        text = content.decode("utf-8", errors="ignore")
    else:
        raise HTTPException(
            status_code=400,
            detail="Only .txt and .md files are supported currently",
        )

    chunks_text = _chunk_text(text)
    chunks = []
    for i, chunk in enumerate(chunks_text):
        kc = KnowledgeChunk(
            site_id=site_id,
            source_name=file.filename,
            content=chunk,
            chunk_index=i,
        )
        db.add(kc)
        chunks.append(kc)
    await db.flush()
    chunk_ids = [chunk.id for chunk in chunks]
    await db.commit()
    background_tasks.add_task(_embed_chunks_background, chunk_ids)
    return chunks


@router.get("", response_model=list[KnowledgeOut])
async def list_knowledge(
    site_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_site(db, site_id, current_user.id)
    result = await db.execute(
        select(KnowledgeChunk).where(KnowledgeChunk.site_id == site_id)
    )
    return result.scalars().all()


@router.delete("/{chunk_id}", status_code=204)
async def delete_knowledge(
    site_id: str,
    chunk_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_site(db, site_id, current_user.id)
    await db.execute(
        delete(KnowledgeChunk).where(
            KnowledgeChunk.id == chunk_id,
            KnowledgeChunk.site_id == site_id,
        )
    )


@router.delete("", status_code=204)
async def clear_knowledge(
    site_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_site(db, site_id, current_user.id)
    await db.execute(
        delete(KnowledgeChunk).where(KnowledgeChunk.site_id == site_id)
    )
