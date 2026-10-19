"""Create the consent based study meeting room without migrating retired rooms."""

import sqlalchemy as sa
from alembic import op
from app.study_meetings import SCHEMA

revision = "20261016_0021"
down_revision = "20261015_0020"
branch_labels = None
depends_on = None


def upgrade():
    for statement in SCHEMA.split(";"):
        if statement.strip():
            op.execute(statement)
    bind = op.get_bind()
    meeting_columns = {column["name"] for column in sa.inspect(bind).get_columns("facilitated_meetings")}
    for name, column in (
        ("client_key", sa.Column("client_key", sa.Text())),
        ("plan_item_id", sa.Column("plan_item_id", sa.Text())),
        ("current_segment", sa.Column("current_segment", sa.Integer(), nullable=False, server_default="0")),
        ("activity_started_at", sa.Column("activity_started_at", sa.Text())),
    ):
        if name not in meeting_columns:
            op.add_column("facilitated_meetings", column)
    member_columns = {column["name"] for column in sa.inspect(bind).get_columns("facilitated_members")}
    if "learning_goal" not in member_columns:
        op.add_column("facilitated_members", sa.Column("learning_goal", sa.Text(), nullable=False, server_default=""))
    if "finished_at" not in member_columns:
        op.add_column("facilitated_members", sa.Column("finished_at", sa.Text()))
    suggestion_columns = {column["name"] for column in sa.inspect(bind).get_columns("facilitated_suggestions")}
    if "report_reason" not in suggestion_columns:
        op.add_column("facilitated_suggestions", sa.Column("report_reason", sa.Text()))
    timeline_columns = {column["name"] for column in sa.inspect(bind).get_columns("facilitated_timelines")}
    for name in ("goal", "starts_at", "ends_at"):
        if name not in timeline_columns:
            op.add_column("facilitated_timelines", sa.Column(name, sa.Text(), nullable=False, server_default=""))
    op.execute("""UPDATE facilitated_timelines SET goal=(SELECT goal FROM facilitated_meetings WHERE id=meeting_id),
      starts_at=(SELECT starts_at FROM facilitated_meetings WHERE id=meeting_id),
      ends_at=(SELECT ends_at FROM facilitated_meetings WHERE id=meeting_id)
      WHERE goal='' OR starts_at='' OR ends_at=''""")
    op.execute("UPDATE facilitated_meetings SET pending_version=0 WHERE pending_version IS NULL")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_facilitated_create_key ON facilitated_meetings(creator_id,client_key)")


def downgrade():
    for table in (
        "facilitated_preparations", "facilitated_ai_reservations", "facilitated_suggestions", "facilitated_messages", "facilitated_confirmations",
        "facilitated_timelines", "facilitated_reminders", "facilitated_members", "facilitated_meetings",
    ):
        op.execute(f"DROP TABLE IF EXISTS {table}")
