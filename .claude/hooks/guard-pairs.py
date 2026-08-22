#!/usr/bin/env python3
"""PostToolUse:Edit|Write|MultiEdit — remind about the other half of a paired file.

Some facts in this repo are deliberately declared once and read from two sides:
a content-type id is a Contentful validation and a build-time guard, a CSP is a
CloudFront header and a Vite setting. Editing one side and not the other fails
silently — the build stays green and the rule quietly stops holding.

Context rather than a block: not every edit to these files needs a paired
change, and a hook cannot tell which. Pairs live in config.json.
"""
import sys

from _common import add_context, load_config, load_payload, matches_any, rel, repo_root, trim

WRITE_TOOLS = {"Edit", "Write", "MultiEdit"}


def main():
    payload = load_payload()
    if payload.get("tool_name") not in WRITE_TOOLS:
        return 0

    path = (payload.get("tool_input") or {}).get("file_path", "")
    if not path:
        return 0

    relative = rel(path, repo_root(payload))
    notes = [
        "[%s] %s" % (pair.get("name", "paired file"), pair["reminder"])
        for pair in load_config().get("pairedPaths", [])
        if pair.get("reminder") and matches_any(relative, pair.get("paths", []))
    ]

    if notes:
        add_context("PostToolUse", trim("\n\n".join(notes)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
