"""Helpers for detecting whether OAuth credentials are actually configured."""

_PLACEHOLDER_MARKERS = (
    "your_google_client",
    "your_linkedin_client",
    "your-super-secret",
    "change-this",
    "placeholder",
    "example",
    "xxx",
)


def is_oauth_credential_configured(value: str) -> bool:
    """Return True when a credential looks real, not a template placeholder."""
    if not value or not value.strip():
        return False

    normalized = value.strip().lower()
    if normalized.startswith("your_"):
        return False

    return not any(marker in normalized for marker in _PLACEHOLDER_MARKERS)


def is_google_oauth_configured(client_id: str, client_secret: str) -> bool:
    return is_oauth_credential_configured(client_id) and is_oauth_credential_configured(client_secret)


def is_linkedin_oauth_configured(client_id: str, client_secret: str) -> bool:
    return is_oauth_credential_configured(client_id) and is_oauth_credential_configured(client_secret)
