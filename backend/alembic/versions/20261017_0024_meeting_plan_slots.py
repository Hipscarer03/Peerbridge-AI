"""Track the booked plan slot separately from a shortened meeting timeline."""

import sqlalchemy as sa
from alembic import op

revision = "20261017_0024"
down_revision = "20261016_0023"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    columns = {column["name"] for column in sa.inspect(bind).get_columns("facilitated_meetings")}
    if "plan_starts_at" not in columns:
        op.add_column("facilitated_meetings", sa.Column("plan_starts_at", sa.Text()))
    if "plan_ends_at" not in columns:
        op.add_column("facilitated_meetings", sa.Column("plan_ends_at", sa.Text()))
    bind.execute(sa.text("""UPDATE facilitated_meetings
        SET plan_starts_at=COALESCE(plan_starts_at,starts_at),
            plan_ends_at=COALESCE(plan_ends_at,ends_at)
        WHERE plan_item_id IS NOT NULL"""))


def downgrade():
    bind = op.get_bind()
    columns = {column["name"] for column in sa.inspect(bind).get_columns("facilitated_meetings")}
    with op.batch_alter_table("facilitated_meetings") as batch:
        if "plan_ends_at" in columns:
            batch.drop_column("plan_ends_at")
        if "plan_starts_at" in columns:
            batch.drop_column("plan_starts_at")
