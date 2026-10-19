"""Persist normalized matching goal."""
import sqlalchemy as sa
from alembic import op

revision = "20261013_0016"
down_revision = "20261013_0015"
branch_labels = None
depends_on = None


def upgrade():
    if "matching_goal" not in {c["name"] for c in sa.inspect(op.get_bind()).get_columns("profiles")}:
        op.add_column("profiles", sa.Column("matching_goal", sa.JSON(), nullable=False, server_default="{}"))


def downgrade():
    op.drop_column("profiles", "matching_goal")
