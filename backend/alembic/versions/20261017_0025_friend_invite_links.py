"""Personal friend invitation links."""

from alembic import op

revision = "20261017_0025"
down_revision = "20261017_0024"
branch_labels = None
depends_on = None


def upgrade():
    columns = {row[1] for row in op.get_bind().exec_driver_sql("PRAGMA table_info(connection_requests)")}
    if "source" not in columns:
        op.execute("ALTER TABLE connection_requests ADD COLUMN source TEXT NOT NULL DEFAULT 'discovery'")
    op.execute("""CREATE TABLE IF NOT EXISTS friend_invite_links (
        owner_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL
    )""")


def downgrade():
    op.execute("DROP TABLE IF EXISTS friend_invite_links")
