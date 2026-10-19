"""Node generate_guidance: gợi ý Socratic bám tài liệu; không có tài liệu hoặc LLM lỗi thì giữ template."""

from pydantic import BaseModel, Field

from ..llm import LLMClient
from ..prompts import GUIDANCE_SYSTEM_PROMPT, build_guidance_user_prompt
<<<<<<< HEAD
from ..state import ModeratorState


=======
from ..rules import normalize_text
from ..state import ModeratorState


def contextual_fallback(state: ModeratorState) -> str:
    """Safe, varied first step when no model or corpus is configured."""
    payload = state["input"]
    session = payload.socratic_session
    message = payload.message.casefold()
    if session and any(word in message for word in ("không biết", "khong biet", "chưa biết", "chua biet", "bắt đầu", "bat dau")):
        return "Mình cùng bắt đầu từ yêu cầu của bài bạn hỏi. Theo bạn, trước tiên cần xác định thông tin nào trong đề?"
    if session and session.turn_count >= 2:
        return "Từ ý bạn vừa nêu, bạn thử chọn một bước nhỏ tiếp theo được không? Bạn đang vướng ở khái niệm nào của bước đó?"
    return "Bạn hãy xác định điều đề bài đang yêu cầu trước nhé. Theo bạn cần tìm thông tin nào đầu tiên?"


>>>>>>> 29066618049be865e9daa585fed068c149bc780f
class GuidanceResult(BaseModel):
    """JSON hợp lệ mà LLM phải trả cho gợi ý."""

    guidance: str = Field(min_length=1)  # độ dài và nội dung do output_guard kiểm tra


async def generate_guidance(state: ModeratorState, llm: LLMClient) -> dict:
    """Trả guidance từ LLM nếu hợp lệ; ngược lại giữ guidance template và chỉ ghi errors."""
    errors = list(state.get("errors", []))
    sources = state.get("retrieved_sources", [])
<<<<<<< HEAD
    if not sources:
        errors.append("generate_guidance: không có tài liệu khớp, dùng template")
        return {"errors": errors}
    payload = state["input"]
    try:
        raw = await llm.complete_json(
            GUIDANCE_SYSTEM_PROMPT, build_guidance_user_prompt(payload.message, payload.conversation_history, sources)
        )
        guidance = GuidanceResult.model_validate(raw).guidance.strip()
    except Exception as exc:  # noqa: BLE001 - LLM lỗi thì dùng template
        errors.append(f"generate_guidance: {type(exc).__name__}: {exc}")
        return {"errors": errors}
    return {"guidance": guidance, "errors": errors}
=======
    payload = state["input"]
    session = payload.socratic_session
    grounded = None
    try:
        raw = await llm.complete_json(
            GUIDANCE_SYSTEM_PROMPT, build_guidance_user_prompt(payload.message, payload.conversation_history, sources,
                session.original_question if session else payload.message,
                session.topic if session else payload.room_topic,
                session.last_guidance or "" if session else "")
        )
        guidance = GuidanceResult.model_validate(raw).guidance.strip()
        if not sources and any(phrase in normalize_text(guidance) for phrase in
                               ("theo tai lieu", "trong tai lieu", "tai lieu cho biet")):
            errors.append("generate_guidance: unsupported material claim")
            guidance = contextual_fallback(state)
        else:
            grounded = sources[0] if sources else None
    except Exception as exc:  # noqa: BLE001 - LLM lỗi thì dùng template
        errors.append(f"generate_guidance: {type(exc).__name__}: {exc}")
        guidance = contextual_fallback(state)
    return {"guidance": guidance, "errors": errors, "llm_called": True, "grounded_source": grounded}
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
