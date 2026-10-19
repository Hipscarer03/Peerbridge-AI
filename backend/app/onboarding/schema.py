import json
import re
import sqlite3

<<<<<<< HEAD
from ..learning_domains import DOMAIN_PREFIXES, DOMAIN_SQL_VALUES
from .catalog import load_catalog
from .contracts import CATALOG_VERSION

SCHEMA = f"""
CREATE TABLE IF NOT EXISTS concepts (
    id TEXT PRIMARY KEY,
    domain TEXT NOT NULL CHECK(domain IN ({DOMAIN_SQL_VALUES})),
=======
from .catalog import load_catalog
from .contracts import CATALOG_VERSION

SCHEMA = """
CREATE TABLE IF NOT EXISTS concepts (
    id TEXT PRIMARY KEY,
    domain TEXT NOT NULL CHECK(domain IN ('sql', 'python', 'ai')),
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    prerequisites TEXT NOT NULL,
    aliases TEXT NOT NULL,
    embedding TEXT,
    catalog_version TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS onboarding_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    payload TEXT NOT NULL,
    mappings TEXT NOT NULL,
    revision INTEGER NOT NULL CHECK(revision >= 1),
    status TEXT NOT NULL CHECK(status IN ('draft', 'confirmed')),
    updated_at TEXT NOT NULL,
    confirmed_at TEXT
);
CREATE TABLE IF NOT EXISTS user_concepts (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    concept_id TEXT NOT NULL REFERENCES concepts(id),
    role TEXT NOT NULL CHECK(role IN ('need', 'offer')),
    self_level TEXT NOT NULL CHECK(self_level IN ('unknown', 'learning', 'strong')),
    theta REAL NOT NULL,
    n_attempts INTEGER NOT NULL DEFAULT 0 CHECK(n_attempts >= 0),
    PRIMARY KEY(user_id, concept_id, role)
);
CREATE INDEX IF NOT EXISTS idx_user_concepts_concept ON user_concepts(concept_id, role);
"""


<<<<<<< HEAD
def expand_concept_domains(connection: sqlite3.Connection) -> None:
    """Rebuild the old domain constraint without deleting linked learner records."""
    row = connection.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='concepts'").fetchone()
    if not row:
        return
    constraint = re.search(r'CHECK\s*\(\s*(?:domain|"domain"|`domain`|\[domain\])\s+IN\s*\(([^)]*)\)\s*\)', row[0], re.IGNORECASE)
    allowed = set(re.findall(r"'([^']*)'", constraint[1])) if constraint else set()
    if set(DOMAIN_PREFIXES) <= allowed:
        return
    stored = {item[0] for item in connection.execute("SELECT DISTINCT domain FROM concepts")}
    unsupported = stored - set(DOMAIN_PREFIXES)
    if unsupported:
        raise ValueError("Cannot migrate concept domains without preserving existing data. Add these domains to learning_domains.py first: " + ", ".join(sorted(unsupported)))
    connection.commit()
    foreign_keys = connection.execute("PRAGMA foreign_keys").fetchone()[0]
    connection.execute("PRAGMA foreign_keys=OFF")
    try:
        connection.execute("BEGIN IMMEDIATE")
        retained_sql = [item[0] for item in connection.execute("SELECT sql FROM sqlite_master WHERE tbl_name='concepts' AND type IN ('index', 'trigger') AND sql IS NOT NULL")]
        definition = SCHEMA.split("CREATE TABLE IF NOT EXISTS onboarding_profiles", 1)[0]
        connection.execute(definition.replace("CREATE TABLE IF NOT EXISTS concepts", "CREATE TABLE concepts_expanded").strip().rstrip(";"))
        connection.execute("INSERT INTO concepts_expanded SELECT id,domain,name,description,prerequisites,aliases,embedding,catalog_version FROM concepts")
        connection.execute("DROP TABLE concepts")
        connection.execute("ALTER TABLE concepts_expanded RENAME TO concepts")
        for statement in retained_sql:
            connection.execute(statement)
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.execute(f"PRAGMA foreign_keys={int(foreign_keys)}")
=======
_OLD_DOMAIN_CHECK = re.compile(r"CHECK\s*\(\s*domain IN \('sql', 'python'\)\s*\)")


def allow_ai_domain(connection: sqlite3.Connection) -> None:
    """Database cũ chỉ cho domain sql/python: nới CHECK để nhận thêm domain "ai" (khóa AICB).

    Chỉ nới ràng buộc, dữ liệu cũ vẫn hợp lệ, nên sửa thẳng câu CREATE theo cách SQLite hướng dẫn
    ("Making Other Kinds Of Table Schema Changes") thay vì dựng lại bảng đang được user_concepts tham chiếu.
    """
    row = connection.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='concepts'").fetchone()
    if row is None or not _OLD_DOMAIN_CHECK.search(row[0]):
        return
    new_sql = _OLD_DOMAIN_CHECK.sub("CHECK(domain IN ('sql', 'python', 'ai'))", row[0])
    version = connection.execute("PRAGMA schema_version").fetchone()[0]
    connection.execute("PRAGMA writable_schema=ON")
    try:
        connection.execute("UPDATE sqlite_master SET sql=? WHERE type='table' AND name='concepts'", (new_sql,))
        connection.execute(f"PRAGMA schema_version={version + 1}")
    finally:
        connection.execute("PRAGMA writable_schema=OFF")
>>>>>>> 29066618049be865e9daa585fed068c149bc780f


def initialize_onboarding(connection: sqlite3.Connection) -> None:
    connection.executescript(SCHEMA)
<<<<<<< HEAD
    expand_concept_domains(connection)
=======
    allow_ai_domain(connection)
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    connection.executemany(
        """INSERT INTO concepts(id, domain, name, description, prerequisites, aliases, catalog_version)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET domain=excluded.domain, name=excluded.name,
             description=excluded.description, prerequisites=excluded.prerequisites,
             aliases=excluded.aliases, catalog_version=excluded.catalog_version""",
        [(item.id, item.domain, item.name, item.description,
          json.dumps(item.prerequisites), json.dumps(item.aliases, ensure_ascii=False), CATALOG_VERSION)
         for item in load_catalog()],
    )
