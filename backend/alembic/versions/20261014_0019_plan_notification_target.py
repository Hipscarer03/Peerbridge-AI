"""Keep the related pair and lesson when opening a plan notification."""
import sqlalchemy as sa
from alembic import op

revision = "20261014_0019"
down_revision = "20261014_0018"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    if "target" not in {column["name"] for column in sa.inspect(bind).get_columns("notifications")}:
        op.add_column("notifications", sa.Column("target", sa.Text(), nullable=False, server_default="{}"))


def downgrade():
    op.drop_column("notifications", "target")
