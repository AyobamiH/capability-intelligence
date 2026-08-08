# Security

## Reporting

Report vulnerabilities through GitHub private vulnerability reporting when it is enabled for this repository. Do not include credentials, tokens, private source contents, session data, or other secrets in an issue, pull request, log, screenshot, or report.

If private vulnerability reporting is unavailable, open a minimal public issue asking the maintainer to establish a private contact channel. Do not disclose exploit details in that issue.

## Security Model

Capability Intelligence uses allowlisted metadata adapters and conservative lifecycle states. A default scan must not authenticate, install, enable, invoke, update, or remove capabilities. Missing runtime evidence remains unknown rather than being promoted to a successful state.

Redacted export reduces selected path and description data; it is not a guarantee of anonymity or approval for unrestricted sharing. Unsupported or ambiguous operations must stop instead of inferring authority.
