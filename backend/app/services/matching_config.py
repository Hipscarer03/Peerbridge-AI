from types import MappingProxyType

<<<<<<< HEAD
# Core Waterfall Features (Spec v2.1)
FEATURE_CONCEPT_SCORE = "concept_score"
FEATURE_STYLE_SCORE = "style_score"
FEATURE_GOAL_SCORE = "goal_score"

# Legacy Features (for backward compatibility)
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
FEATURE_SKILL_COMPLEMENTARITY = "skill_complementarity"
FEATURE_TOPIC_COMPATIBILITY = "topic_compatibility"
FEATURE_AVAILABILITY_OVERLAP = "availability_overlap"
FEATURE_PREFERENCE_COMPATIBILITY = "preference_compatibility"

<<<<<<< HEAD
# Waterfall Tiers
TIER_1_GOLDEN = "tier_1_golden"        # Bù trừ 2 chiều (Golden Match)
TIER_2_PEER = "tier_2_peer"            # Cùng tiến (Peer Match)
TIER_3_DISCIPLINE = "tier_3_discipline" # Đồng hành kỷ luật (Body Double)
TIER_4_QUEUE = "tier_4_queue"          # Gợi ý ít điểm chung; giữ key để tương thích dữ liệu cũ

# Waterfall Dynamic Weights (Spec Section 6.1)
TIER_WEIGHTS = MappingProxyType(
    {
        TIER_1_GOLDEN: MappingProxyType(
            {
                FEATURE_CONCEPT_SCORE: 0.35,
                FEATURE_STYLE_SCORE: 0.45,
                FEATURE_GOAL_SCORE: 0.20,
            }
        ),
        TIER_2_PEER: MappingProxyType(
            {
                FEATURE_CONCEPT_SCORE: 0.25,
                FEATURE_STYLE_SCORE: 0.50,
                FEATURE_GOAL_SCORE: 0.25,
            }
        ),
        TIER_3_DISCIPLINE: MappingProxyType(
            {
                FEATURE_CONCEPT_SCORE: 0.00,
                FEATURE_STYLE_SCORE: 0.60,
                FEATURE_GOAL_SCORE: 0.40,
            }
        ),
    }
)

# Waterfall Tier Badges & Labels (Spec Section 6.1 & 10)
TIER_BADGES = MappingProxyType(
    {
        TIER_1_GOLDEN: MappingProxyType(
            {
                "badge": "🌟 Cặp đôi bù trừ hoàn hảo",
                "short_label": "Bù trừ 2 chiều",
                "subtitle": "Người này có thể hướng dẫn điều bạn cần và học được từ bạn",
                "role": "Trao đổi kiến thức (Skill-swap)",
            }
        ),
        TIER_2_PEER: MappingProxyType(
            {
                "badge": "🤝 Cùng cày một môn",
                "short_label": "Bạn cùng tiến",
                "subtitle": "Cả hai bạn cùng ôn chung môn và có phong cách học tương thích cao",
                "role": "Bạn cùng tiến (Study-buddy)",
            }
        ),
        TIER_3_DISCIPLINE: MappingProxyType(
            {
                "badge": "⚡ Đồng đội giữ kỷ luật",
                "short_label": "Đồng hành kỷ luật",
                "subtitle": "Khác chủ đề nhưng có thể cùng giữ nhịp học và theo dõi tiến độ",
                "role": "Điểm danh / Kỷ luật chéo (Accountability)",
            }
        ),
        TIER_4_QUEUE: MappingProxyType(
            {
                "badge": "Thử tìm hiểu thêm",
                "short_label": "Ít điểm chung",
                "subtitle": "Điểm tương thích thấp; hãy xem hồ sơ và trao đổi trước khi quyết định",
                "role": "Gợi ý để tìm hiểu",
            }
        ),
    }
)

# Thresholds & Constants
MIN_MATCH_THRESHOLD = 0.50
UNCERTAIN_SCORE_THRESHOLD = 0.50
MAX_BONUS_DROP = 0.05
MIN_POOL_SIZE = 8
DEFAULT_TOP_K = 10
EXPANDED_MIN_POOL_SIZE = 16
EXPANDED_TOP_K = 20
TOTAL_SCORE_MULTIPLIER = 100
SCORE_DECIMAL_PLACES = 4
MINUTES_PER_HOUR = 60
MINIMUM_SKILL_MATCHES = 1

# Legacy Weights (kept for legacy calculations)
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
MATCHING_WEIGHTS = MappingProxyType(
    {
        FEATURE_SKILL_COMPLEMENTARITY: 0.45,
        FEATURE_TOPIC_COMPATIBILITY: 0.20,
        FEATURE_AVAILABILITY_OVERLAP: 0.25,
        FEATURE_PREFERENCE_COMPATIBILITY: 0.10,
    }
)
<<<<<<< HEAD
=======

DEFAULT_TOP_K = 10
TOTAL_SCORE_MULTIPLIER = 100
SCORE_DECIMAL_PLACES = 6
MINUTES_PER_HOUR = 60
MINIMUM_SKILL_MATCHES = 1
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
