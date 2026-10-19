"""Persist per-lesson feedback and study-together registrations."""
import sqlalchemy as sa
from alembic import op
from app.plan_tables import notes, together

revision = "20261014_0018"
down_revision = "20261014_0017"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    notes.create(bind, checkfirst=True)
    if "plan_item_id" not in {column["name"] for column in sa.inspect(bind).get_columns("pb_plan_notes")}:
        op.add_column("pb_plan_notes", sa.Column("plan_item_id", sa.Text(), nullable=True))
    together.create(bind, checkfirst=True)


def downgrade():
    together.drop(op.get_bind(), checkfirst=True)
    op.drop_column("pb_plan_notes", "plan_item_id")
