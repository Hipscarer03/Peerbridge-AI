"""Expand study domains while preserving concept IDs and learner references."""
import sqlalchemy as sa
from alembic import op
from app.learning_domains import DOMAIN_SQL_VALUES

revision = "20261014_0017"
down_revision = "20261013_0016"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    if bind.dialect.name == "sqlite":
        from app.onboarding.schema import expand_concept_domains

        with op.get_context().autocommit_block():
            expand_concept_domains(bind.connection.driver_connection)
    else:
        constraints = sa.inspect(bind).get_check_constraints("concepts")
        if any(item["name"] == "ck_concepts_domain" for item in constraints):
            op.drop_constraint("ck_concepts_domain", "concepts", type_="check")
        op.create_check_constraint("ck_concepts_domain", "concepts", f"domain IN ({DOMAIN_SQL_VALUES})")


def downgrade():
    raise RuntimeError("Narrowing domains can invalidate learner data. Restore a pre-migration backup instead.")
