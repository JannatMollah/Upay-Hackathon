"""
MilestoneAI — Input Sanitizer
Defends against prompt injection in LLM inputs.
"""

import re
from typing import Optional


# Allowed patterns for user context fields
ALLOWED_PATTERNS = {
    "user_id": re.compile(r"^U\d{9}$"),
    "milestone": re.compile(r"^M[2-5]$"),
    "area_type": re.compile(r"^(urban|peri_urban|rural)$"),
    "device_type": re.compile(r"^(smartphone_android|smartphone_ios|feature_phone)$"),
    "division": re.compile(r"^(dhaka|chittagong|rajshahi|khulna|rangpur|sylhet|barishal|mymensingh)$"),
    "language_preference": re.compile(r"^(bangla|english|both)$"),
    "bonus_amount": re.compile(r"^\d{1,3}$"),
}

# Banned patterns in any input
BANNED_PATTERNS = [
    re.compile(r"ignore\s+(previous|above|all)\s+(instructions?|prompts?)", re.IGNORECASE),
    re.compile(r"system\s*prompt", re.IGNORECASE),
    re.compile(r"<\s*/?script", re.IGNORECASE),
    re.compile(r"javascript:", re.IGNORECASE),
    re.compile(r"eval\s*\(", re.IGNORECASE),
    re.compile(r"exec\s*\(", re.IGNORECASE),
]

# Banned patterns in LLM output (nudge text)
OUTPUT_BANNED_PATTERNS = [
    re.compile(r"https?://", re.IGNORECASE),         # No URLs
    re.compile(r"\b\d{11}\b"),                        # No phone numbers (11 digits)
    re.compile(r"@[a-zA-Z]"),                         # No email-like patterns
    re.compile(r"password|পাসওয়ার্ড", re.IGNORECASE),  # No password mentions
    re.compile(r"PIN|পিন", re.IGNORECASE),             # No PIN mentions
]


def sanitize_input(field_name: str, value: str) -> tuple[bool, str]:
    """
    Validate and sanitize a single input field.

    Returns:
        (is_valid, sanitized_value_or_error_message)
    """
    if not isinstance(value, str):
        value = str(value)

    # Check banned patterns
    for pattern in BANNED_PATTERNS:
        if pattern.search(value):
            return False, f"Banned pattern detected in {field_name}"

    # Check allowed pattern if defined
    if field_name in ALLOWED_PATTERNS:
        if not ALLOWED_PATTERNS[field_name].match(value):
            return False, f"Invalid format for {field_name}: {value}"

    return True, value


def sanitize_context(context: dict) -> tuple[bool, dict]:
    """
    Validate and sanitize the entire user context for LLM prompt.

    Returns:
        (all_valid, sanitized_context_or_errors)
    """
    sanitized = {}
    errors = []

    for key, value in context.items():
        is_valid, result = sanitize_input(key, str(value))
        if is_valid:
            sanitized[key] = result
        else:
            errors.append(result)

    if errors:
        return False, {"errors": errors}

    return True, sanitized


def validate_nudge_output(nudge_text: str, expected_bonus: int) -> tuple[bool, list]:
    """
    Validate LLM-generated nudge text.

    Returns:
        (is_valid, list_of_violations)
    """
    violations = []

    # Check banned output patterns
    for pattern in OUTPUT_BANNED_PATTERNS:
        if pattern.search(nudge_text):
            violations.append(f"Output contains banned pattern: {pattern.pattern}")

    # Check length (50-200 words)
    word_count = len(nudge_text.split())
    if word_count < 5:
        violations.append(f"Nudge too short: {word_count} words")
    if word_count > 200:
        violations.append(f"Nudge too long: {word_count} words")

    return len(violations) == 0, violations
