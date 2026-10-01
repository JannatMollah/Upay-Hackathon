"""
MilestoneAI — Bangla Utilities
Numeral conversions and Bangla string helpers.
"""

EN_TO_BN_NUMERALS = str.maketrans("0123456789", "০১২৩৪৫৬৭৮৯")
BN_TO_EN_NUMERALS = str.maketrans("০১২৩৪৫৬৭৮৯", "0123456789")

MILESTONE_NAMES_BN = {
    "M1": "পিন সেট",
    "M2": "প্রথম রিচার্জ",
    "M3": "ক্যাশ-ইন / অ্যাড মানি",
    "M4": "মার্চেন্ট পেমেন্ট",
    "M5": "ডিপিএস খোলা",
    "M6": "সব মাইলস্টোন সম্পূর্ণ",
}

MILESTONE_NAMES_EN = {
    "M1": "PIN Set",
    "M2": "First Mobile Recharge",
    "M3": "Cash-in / Add Money",
    "M4": "Merchant Payment",
    "M5": "Open DPS Account",
    "M6": "All Milestones Completed",
}


def to_bangla_digits(val) -> str:
    """Convert integer or float or numeric string to Bangla numerals."""
    return str(val).translate(EN_TO_BN_NUMERALS)


def to_english_digits(val: str) -> str:
    """Convert Bangla numeral string to standard digits."""
    return str(val).translate(BN_TO_EN_NUMERALS)


def format_bdt_bangla(amount: float) -> str:
    """Format amount as ৳৫০,০০০ or ৳৫০০."""
    formatted = f"{int(amount):,}"
    return f"৳{formatted.translate(EN_TO_BN_NUMERALS)}"


def get_milestone_name(milestone: str, lang: str = "bn") -> str:
    """Get localized milestone name."""
    if lang == "bn":
        return MILESTONE_NAMES_BN.get(milestone, milestone)
    return MILESTONE_NAMES_EN.get(milestone, milestone)
