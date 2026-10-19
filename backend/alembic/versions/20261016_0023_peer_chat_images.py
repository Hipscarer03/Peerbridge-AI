"""Add private image attachments to partner chat messages."""

import sqlalchemy as sa
from alembic import op

revision = "20261016_0023"
down_revision = "20261016_0022"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    columns = {column["name"] for column in sa.inspect(bind).get_columns("peer_study_messages")}
    if "attachment_path" not in columns:
        op.add_column("peer_study_messages", sa.Column("attachment_path", sa.Text()))
    if "attachment_mime" not in columns:
        op.add_column("peer_study_messages", sa.Column("attachment_mime", sa.Text()))


def downgrade():
    bind = op.get_bind()
    columns = {column["name"] for column in sa.inspect(bind).get_columns("peer_study_messages")}
    with op.batch_alter_table("peer_study_messages") as batch:
        if "attachment_mime" in columns:
            batch.drop_column("attachment_mime")
        if "attachment_path" in columns:
            batch.drop_column("attachment_path")
