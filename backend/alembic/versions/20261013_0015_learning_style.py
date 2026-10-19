"""Persist explicit learning style independently of the biography."""
import sqlalchemy as sa
from alembic import op

revision = "20261013_0015"
down_revision = "20261013_0014"
branch_labels = None
depends_on = None


def upgrade():
    if "learning_style" not in {column["name"] for column in sa.inspect(op.get_bind()).get_columns("profiles")}:
        op.add_column("profiles", sa.Column("learning_style", sa.JSON(), nullable=False, server_default="{}"))


def downgrade():
    op.drop_column("profiles", "learning_style")
