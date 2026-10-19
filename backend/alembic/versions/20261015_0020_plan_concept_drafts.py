"""Store private generated curricula for personal plans."""

from alembic import op
from app.plan_tables import concept_drafts

revision = "20261015_0020"
down_revision = "20261014_0019"
branch_labels = None
depends_on = None


def upgrade():
    concept_drafts.create(op.get_bind(), checkfirst=True)


def downgrade():
    concept_drafts.drop(op.get_bind(), checkfirst=True)
