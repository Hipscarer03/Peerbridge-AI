import unittest

from app.services.matching_engine import determine_deadline_level, extract_learning_style


class ProfileMatchingInputsTest(unittest.TestCase):
    def test_structured_choices_override_unrelated_bio_keywords(self):
        bio = "Mình thích giải thích và trao đổi Python.\nVai trò khi học: Thích nghe\nNhịp học: Học đều mỗi ngày\nPhong cách phản hồi: Thích được hỏi lại, tranh luận\nMôi trường học: Im lặng, tập trung\nKhi gặp khó: Hỏi ngay"
        result = extract_learning_style({"profile": {"bio": "Thích giải thích và nói chuyện", "learning_style": dict(line.split(": ", 1) for line in bio.splitlines() if ": " in line)}})
        self.assertEqual({key: value[0] for key, value in result.items()}, {
            "role": "nghe", "pace": "deu_dan", "feedback": "tranh_luan",
            "environment": "im_lang", "obstacle": "hoi_ngay",
        })

    def test_structured_duration_uses_number_and_unit(self):
        for duration, expected in [("2 tuần", "gap"), ("4 tuần", "vua"), ("7 tuần", "dai"), ("1 tháng", "vua"), ("1 năm", "dai")]:
            with self.subTest(duration=duration):
                self.assertEqual(determine_deadline_level({"profile": {"learning_goals": [f"Muốn học SQL trong {duration}"]}}), expected)

    def test_free_bio_does_not_define_learning_style(self):
        result = extract_learning_style({"profile": {"bio": "Thích giải thích, học dồn theo đợt"}})
        self.assertTrue(all(value == ("unknown", 0.0) for value in result.values()))
