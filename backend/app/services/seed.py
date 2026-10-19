import json
from pathlib import Path

from ..db import database, utc_now
from ..security import hash_password


def seed_profiles() -> int:
    source = Path(__file__).resolve().parents[2] / "data" / "seed_profiles.json"
    profiles = json.loads(source.read_text(encoding="utf-8"))
    inserted = 0
    with database() as connection:
        for index, profile in enumerate(profiles):
<<<<<<< HEAD
            email = profile.get("email", f"seed-{profile['slug']}@dongdieu.local")
            existing = connection.execute("SELECT id, is_seed FROM users WHERE email = ?", (email,)).fetchone()
            if existing and not existing["is_seed"]:
                # Never claim or rewrite a real account that happens to use a fixture email.
                continue
            now = utc_now()
            if existing:
                user_id = int(existing["id"])
            else:
                cursor = connection.execute(
                    "INSERT INTO users(email, password_hash, is_seed, simulated_interest, created_at) VALUES (?, ?, 1, ?, ?)",
                    (email, hash_password(f"seed-{index}-not-for-login"), int(profile["simulated_interest"]), now),
                )
                user_id = int(cursor.lastrowid)
                inserted += 1

            connection.execute(
                """INSERT INTO profiles(
                    user_id, display_name, age, city, occupation, bio, intent,
                    interests, available_times, avatar_style, school, major, subjects, learning_goals,
                    matching_goal, learning_style, study_year, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(user_id) DO UPDATE SET
                    display_name=excluded.display_name, age=excluded.age, city=excluded.city,
                    occupation=excluded.occupation, bio=excluded.bio, intent=excluded.intent,
                    interests=excluded.interests, available_times=excluded.available_times,
                    avatar_style=excluded.avatar_style, school=excluded.school, major=excluded.major,
                    subjects=excluded.subjects, learning_goals=excluded.learning_goals,
                    matching_goal=excluded.matching_goal, learning_style=excluded.learning_style,
                    study_year=excluded.study_year, updated_at=excluded.updated_at""",
                (
                    user_id, profile["name"], profile["age"], profile["city"],
=======
            email = f"seed-{profile['slug']}@dongdieu.local"
            existing = connection.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
            if existing:
                continue
            cursor = connection.execute(
                "INSERT INTO users(email, password_hash, is_seed, simulated_interest, created_at) VALUES (?, ?, 1, ?, ?)",
                (email, hash_password(f"seed-{index}-not-for-login"), int(profile["simulated_interest"]), utc_now()),
            )
            connection.execute(
                """INSERT INTO profiles(
                    user_id, display_name, age, city, occupation, bio, intent,
                    interests, available_times, avatar_style, school, major, subjects, learning_goals, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    cursor.lastrowid, profile["name"], profile["age"], profile["city"],
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
                    profile["occupation"], profile["bio"], profile["intent"],
                    json.dumps(profile["interests"], ensure_ascii=False),
                    json.dumps(profile["available_times"], ensure_ascii=False),
                    profile["avatar_style"], profile.get("school", ""), profile.get("major", ""),
                    json.dumps(profile.get("subjects", []), ensure_ascii=False),
                    json.dumps(profile.get("learning_goals", []), ensure_ascii=False),
<<<<<<< HEAD
                    json.dumps(profile.get("matching_goal", {}), ensure_ascii=False),
                    json.dumps(profile.get("learning_style", {}), ensure_ascii=False),
                    profile.get("study_year", ""), now,
                ),
            )

            # Demo identities are synthetic, so keep their matching inputs aligned
            # with the fixture while leaving every non-seed account untouched.
            connection.execute("DELETE FROM help_needs WHERE profile_user_id = ?", (user_id,))
            connection.execute("DELETE FROM help_offers WHERE profile_user_id = ?", (user_id,))
            connection.execute("DELETE FROM availability WHERE profile_user_id = ?", (user_id,))
            connection.executemany(
                """INSERT INTO help_needs(
                    profile_user_id, topic, description, current_level, target_outcome, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)""",
                [
                    (user_id, item["topic"], item.get("description", ""), item.get("current_level", ""),
                     item.get("target_outcome", ""), now, now)
                    for item in profile.get("needs_help_with", [])
                ],
            )
            connection.executemany(
                """INSERT INTO help_offers(
                    profile_user_id, topic, description, proficiency_level, max_sessions_per_week, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)""",
                [
                    (user_id, item["topic"], item.get("description", ""), item.get("proficiency_level", ""),
                     item.get("max_sessions_per_week", 2), now, now)
                    for item in profile.get("can_help_with", [])
                ],
            )
            for slot in profile.get("available_times", []):
                day = int(slot["day_of_week"])
                start, end = slot["start_time"], slot["end_time"]
                intervals = [(day, start, end)] if end > start else [
                    (day, start, "23:59"), ((day + 1) % 7, "00:00", end)
                ]
                connection.executemany(
                    """INSERT INTO availability(
                        profile_user_id, day_of_week, start_time, end_time, timezone, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, 'Asia/Bangkok', ?, ?)""",
                    [(user_id, d, start_time, end_time, now, now)
                     for d, start_time, end_time in intervals],
                )
=======
                    utc_now(),
                ),
            )
            inserted += 1
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    return inserted

