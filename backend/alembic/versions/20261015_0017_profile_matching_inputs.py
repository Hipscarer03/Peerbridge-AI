"""Add explicit matching inputs after the integrated AI concept migration."""

import sqlalchemy as sa
from alembic import op

revision = "20261015_0017"
down_revision = "20261010_0016"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Preserve existing profiles and add optional matching metadata."""
    columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("profiles")}
    additions = [
        sa.Column("study_year", sa.String(40), nullable=False, server_default=""),
        sa.Column("learning_style", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("matching_goal", sa.JSON(), nullable=False, server_default="{}"),
    ]
    for column in additions:
        if column.name not in columns:
            op.add_column("profiles", column)


def downgrade() -> None:
    """Remove matching metadata without changing existing learning records."""
    for column in ("matching_goal", "learning_style", "study_year"):
        op.drop_column("profiles", column)
