"""Store direct messages between connected study partners."""

from alembic import op

revision = "20261016_0022"
down_revision = "20261016_0021"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("""CREATE TABLE IF NOT EXISTS peer_study_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      peer_match_id INTEGER NOT NULL REFERENCES peer_matches(id),
      sender_id INTEGER NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      client_key TEXT NOT NULL,
      UNIQUE(peer_match_id,sender_id,client_key)
    )""")
    op.execute("CREATE INDEX IF NOT EXISTS idx_peer_study_messages ON peer_study_messages(peer_match_id,id)")
    op.execute("""INSERT OR IGNORE INTO peer_study_messages(peer_match_id,sender_id,content,created_at,client_key)
      SELECT m.peer_match_id,msg.sender_id,msg.content,msg.created_at,'meeting:' || msg.id
      FROM facilitated_messages msg JOIN facilitated_meetings m ON m.id=msg.meeting_id""")


def downgrade():
    op.execute("DROP INDEX IF EXISTS idx_peer_study_messages")
    op.execute("DROP TABLE IF EXISTS peer_study_messages")
