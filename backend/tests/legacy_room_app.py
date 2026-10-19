"""Isolated harness for archived room/moderation behavior, never mounted in production."""

from app.main import lifespan
from app.routers import instructor_moderation, sessions, study_room
from fastapi import FastAPI


def legacy_room_app():
    app = FastAPI(lifespan=lifespan)
    app.include_router(sessions.router, prefix="/api/v1")
    app.include_router(study_room.router)
    app.include_router(instructor_moderation.router)
    return app
