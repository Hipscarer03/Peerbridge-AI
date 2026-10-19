"""Normalize explicit matching inputs once when a profile is saved."""
import re

GOAL_RE = re.compile(r"^muốn học\.?\s+(.+?)\s+trong\s+([1-9]\d*)\s+(ngày|tuần|tháng|năm)\.?$", re.IGNORECASE)
STYLE_OPTIONS = {
    "Vai trò khi học": {"Thích giải thích", "Thích nghe", "Cân bằng"},
    "Nhịp học": {"Học dồn theo đợt", "Học đều mỗi ngày"},
    "Phong cách phản hồi": {"Thích được hỏi lại, tranh luận", "Thích tự làm rồi mới hỏi", "Linh hoạt"},
    "Môi trường học": {"Im lặng, tập trung", "Nói chuyện, trao đổi nhiều"},
    "Khi gặp khó": {"Tự research trước", "Hỏi ngay", "Tùy tình huống"},
}


def normalize_goal(goals: list[str]) -> dict:
    # Empty profiles remain readable/editable for legacy onboarding.
    if not goals:
        return {}
    if len(goals) != 1 or not (match := GOAL_RE.fullmatch(goals[0].strip())):
        raise ValueError("Chỉ nhập một mục tiêu theo mẫu: Muốn học SQL trong 4 tuần")
    topic, quantity, unit = match.groups()
    days = int(quantity) * {"ngày": 1, "tuần": 7, "tháng": 30, "năm": 365}[unit.lower()]
    return {"topic": topic.strip(), "duration_days": days,
            "deadline_level": "gap" if days <= 14 else "vua" if days <= 45 else "dai"}


def validate_style(style: dict[str, str]) -> dict[str, str]:
    if any(key not in STYLE_OPTIONS or value not in STYLE_OPTIONS[key] for key, value in style.items()):
        raise ValueError("Lựa chọn phong cách học không hợp lệ")
    return style
