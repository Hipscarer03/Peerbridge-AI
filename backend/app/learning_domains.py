"""Shared study domains and internal ID prefixes for onboarding and planning."""
from typing import Literal, get_args

Domain = Literal[
    "sql", "python", "english", "japanese", "chinese", "spanish", "programming",
    "security", "electronics", "data", "mathematics", "physics", "design", "architecture",
    "media", "marketing", "accounting", "finance", "business", "law", "medicine",
    "biology", "psychology", "education", "academic", "learning", "ai",
]

DOMAIN_ALIASES: dict[str, tuple[str, ...]] = {
    "sql": ("sql", "cơ sở dữ liệu"),
    "python": ("python", "py", "machine learning"),
    "english": ("english", "tiếng anh", "ielts", "toeic"),
    "japanese": ("japanese", "tiếng nhật", "jlpt"),
    "chinese": ("chinese", "tiếng trung", "hsk"),
    "spanish": ("spanish", "tiếng tây ban nha"),
    "programming": ("c++", "javascript", "git", "gdb", "cấu trúc dữ liệu", "thuật toán", "algorithms"),
    "security": ("network security", "bảo mật", "ctf", "an ninh mạng"),
    "electronics": ("vi xử lý", "microcontroller", "điện tử"),
    "data": ("excel", "power query", "power bi", "trực quan hóa dữ liệu"),
    "mathematics": ("xác suất", "thống kê", "tích phân", "toán cao cấp"),
    "physics": ("cơ học", "động lực học", "sơ đồ lực"),
    "design": ("figma", "ui ux", "illustrator", "portfolio", "ký họa"),
    "architecture": ("3ds max", "sketchup", "nội thất", "phối cảnh"),
    "media": ("premiere", "video", "storyboard"),
    "marketing": ("marketing", "ga4", "seo"),
    "accounting": ("kế toán", "định khoản"),
    "finance": ("tài chính", "cfa", "financial reporting"),
    "business": ("mô hình kinh doanh", "quản trị chiến lược", "mba", "business analysis", "business analyst", "phân tích nghiệp vụ", "ba cơ bản"),
    "law": ("pháp luật", "luật dân sự", "điều luật"),
    "medicine": ("nội khoa", "lâm sàng", "dược lý"),
    "biology": ("sinh học", "biological"),
    "psychology": ("tâm lý", "psychology"),
    "education": ("dạy toán", "giáo án", "sư phạm"),
    "academic": ("apa", "trích dẫn", "báo cáo kỹ thuật", "slide", "tóm tắt văn bản"),
    "learning": ("anki", "flashcard", "ôn thi", "ghi nhớ chủ động"),
    "ai": ("trí tuệ nhân tạo", "ai", "llm", "rag", "agent", "langgraph"),
}
DOMAIN_PREFIXES = {domain: "py" if domain == "python" else domain for domain in get_args(Domain)}
DOMAIN_SQL_VALUES = ", ".join(f"'{domain}'" for domain in DOMAIN_PREFIXES)
