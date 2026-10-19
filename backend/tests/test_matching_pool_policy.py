import ast
import sqlite3
import unittest
from pathlib import Path

from app.services.matching_engine import calculate_style_score, find_top_matches, pool_result_limit
from app.services.matching_profile import normalize_goal, validate_style


def profile(user_id, topic="SQL"):
    return {"profile": {"user_id": user_id, "learning_goals": [f"Muốn học {topic} trong 4 tuần"], "learning_style": {}},
            "needs_help_with": [{"topic": topic}], "can_help_with": [], "availability": []}


class PoolPolicyTests(unittest.TestCase):
    def test_pool_boundaries(self):
        for pool, expected in [(0, 0), (1, 1), (3, 3), (5, 5), (10, 8), (25, 8), (26, 8), (30, 8), (50, 10), (75, 10), (1000, 10)]:
            self.assertEqual(pool_result_limit(pool), expected)
        for pool, expected in [(0, 0), (3, 3), (10, 10), (25, 16), (50, 20)]:
            self.assertEqual(pool_result_limit(pool, expanded=True), expected)

    def test_dynamic_limit_includes_low_relevance_candidates_when_pool_is_small(self):
        candidates = [profile(i) for i in range(2, 8)] + [profile(100, "Piano")]
        matches = find_top_matches(profile(1), candidates)
        self.assertEqual(len(matches), 7)
        self.assertEqual([item["candidate_id"] for item in matches][-1], 100)
        self.assertEqual([m["rank"] for m in matches], list(range(1, 8)))

    def test_unknown_style_is_neutral(self):
        self.assertEqual(calculate_style_score(profile(1), profile(2)), 0.5)

    def test_goal_validation_and_normalization(self):
        self.assertEqual(normalize_goal(["Muốn học SQL trong 4 tuần"]), {"topic": "SQL", "duration_days": 28, "deadline_level": "vua"})
        self.assertEqual(normalize_goal(["Muốn học Product trong 5 tháng"]), {"topic": "Product", "duration_days": 150, "deadline_level": "dai"})
        for goals in [["Học SQL"], ["Muốn học SQL trong 0 tuần"], ["Muốn học SQL trong 4 tuần"] * 2]:
            with self.assertRaises(ValueError):
                normalize_goal(goals)
        with self.assertRaises(ValueError):
            validate_style({"Vai trò khi học": "invalid"})

    def test_search_service_has_no_llm_dependency(self):
        source = (Path(__file__).parents[1] / "app/services/matches.py").read_text(encoding="utf-8")
        tree = ast.parse(source)
        self.assertFalse(any(isinstance(n, ast.ImportFrom) and n.module and "match_ai" in n.module for n in ast.walk(tree)))
        self.assertNotIn("rerank(", source)


class MatchingRepositoryIntegrationTests(unittest.TestCase):
    def test_saved_goal_and_sql_eligibility(self):
        from app.repositories.profiles import ProfileRepository
        from app.schemas import ProfileMeUpdate
        connection = sqlite3.connect(":memory:")
        connection.row_factory = sqlite3.Row
        backend = Path(__file__).parents[1]
        for relative in ["app/db.py", "app/matching/schema.py"]:
            tree = ast.parse((backend / relative).read_text(encoding="utf-8"))
            schema = next(ast.literal_eval(n.value) for n in tree.body if isinstance(n, ast.Assign) and any(isinstance(t, ast.Name) and t.id == "SCHEMA" for t in n.targets))
            connection.executescript(schema)
        for uid in range(1, 5):
            connection.execute("INSERT INTO users(id,email,password_hash,created_at) VALUES (?,?,'hash','now')", (uid, f"{uid}@test.local"))
            connection.execute("INSERT INTO profiles(user_id,display_name,age,intent,updated_at) VALUES (?, 'Test', 20, 'conversation','now')", (uid,))
        repository = ProfileRepository(connection)
        payload = ProfileMeUpdate.model_validate({"profile": {"display_name": "Test", "learning_goals": ["Muốn học SQL trong 4 tuần"], "learning_style": {"Vai trò khi học": "Thích nghe"}}, "needs_help_with": [{"topic": "Wrong client topic"}]})
        self.assertTrue(repository.replace_peerbridge_profile(1, payload, "now"))
        bundle = repository.get_profile_bundle(1)
        self.assertEqual(bundle["profile"]["matching_goal"]["duration_days"], 28)
        self.assertEqual(bundle["needs_help_with"][0]["topic"], "SQL")
        connection.execute("INSERT INTO blocks VALUES (2,1,'now')")
        connection.execute("INSERT INTO reports(reporter_id,reported_id,reason,status,created_at) VALUES (1,3,'test','approved','now')")
        connection.execute("INSERT INTO reports(reporter_id,reported_id,reason,status,created_at) VALUES (1,4,'test','pending','now')")
        self.assertEqual([b["profile"]["user_id"] for b in repository.list_matching_profile_bundles(1)], [4])
        repository.replace_peerbridge_profile(4, payload, "now")
        from app.repositories.matches import MatchRequestRepository
        from app.services.matches import MatchSearchService
        service = MatchSearchService(repository, MatchRequestRepository(connection))
        result = service.search_matches({"id": 1, "role": "STUDENT"})
        self.assertEqual(result.matching_mode, "local")
        self.assertEqual([item.candidate_id for item in result.candidates], [4])
        self.assertEqual(result.candidates[0].rank, 1)
        connection.close()
