"""Add session_reviews: tóm tắt phiên học và chấm tuân thủ Socratic."""

from alembic import op
<<<<<<< HEAD

SCHEMA = """
CREATE TABLE IF NOT EXISTS session_reviews (
    session_id INTEGER PRIMARY KEY REFERENCES study_sessions(id) ON DELETE CASCADE,
    mode TEXT NOT NULL CHECK(mode IN ('ai', 'rules')),
    summary TEXT NOT NULL,
    key_points TEXT NOT NULL DEFAULT '[]',
    open_questions TEXT NOT NULL DEFAULT '[]',
    next_steps TEXT NOT NULL DEFAULT '[]',
    socratic_score REAL CHECK(socratic_score IS NULL OR (socratic_score >= 0 AND socratic_score <= 1)),
    answer_leaked INTEGER NOT NULL DEFAULT 0,
    leak_message_ids TEXT NOT NULL DEFAULT '[]',
    judge_notes TEXT NOT NULL DEFAULT '',
    message_count INTEGER NOT NULL DEFAULT 0,
    last_message_id INTEGER NOT NULL DEFAULT 0,
    requested_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
"""
=======
from app.session_review.schema import SCHEMA
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

revision = "20261009_0015"
down_revision = "20261007_0014"
branch_labels = None
depends_on = None


def upgrade():
    for statement in filter(None, (s.strip() for s in SCHEMA.split(";"))):
        op.execute(statement)


def downgrade():
    op.execute("DROP TABLE IF EXISTS session_reviews")
