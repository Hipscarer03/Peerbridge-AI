"""Store the learner study year."""
import sqlalchemy as sa
from alembic import op

revision = "20261013_0014"
down_revision = "20261007_0013"
branch_labels = None
depends_on = None


def upgrade():
    if "study_year" not in {column["name"] for column in sa.inspect(op.get_bind()).get_columns("profiles")}:
        op.add_column("profiles", sa.Column("study_year", sa.String(40), nullable=False, server_default=""))


def downgrade():
    op.drop_column("profiles", "study_year")
