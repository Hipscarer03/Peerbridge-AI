"""Cho phép domain "ai" trong bảng concepts (danh mục bài slide khóa AICB)."""

from alembic import op
<<<<<<< HEAD
=======
from app.onboarding.schema import allow_ai_domain
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

revision = "20261010_0016"
down_revision = "20261009_0015"
branch_labels = None
depends_on = None


def upgrade():
<<<<<<< HEAD
    # The product branch's 20261014_0017 migration expands concept domains.
    # Keep this revision in the graph for databases already stamped on main.
    pass
=======
    allow_ai_domain(op.get_bind().connection.driver_connection)
>>>>>>> 29066618049be865e9daa585fed068c149bc780f


def downgrade():
    op.execute("DELETE FROM concepts WHERE domain='ai'")
