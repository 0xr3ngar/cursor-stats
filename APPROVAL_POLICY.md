# Approval Policy

## Repository context

This is a solo-maintained repository owned by **@0xr3ngar**.

## Reviewer assignment

- **PR opened by someone other than @0xr3ngar** — assign @0xr3ngar as a reviewer.
- **PR opened by @0xr3ngar** — do not request additional human reviewers.

## Auto-approval

Approve pull requests when required CI checks pass, none of the blocking conditions below apply, and any of the following is true:

- The Cursor Bugbot GitHub check is green (passed). A green Bugbot check is sufficient to approve when no blocking feedback applies — even when Bugbot left zero review comments on the PR. Do not wait for a Bugbot review comment when the check has already passed.
- Open review feedback is nit-level only (see below).
- All Cursor Bugbot review comments on the PR are fixed or marked resolved.

Nit-level feedback alone is not a reason to withhold approval. If Bugbot left comments, approve once every comment is fixed or resolved. Absence of Bugbot review comments is never a reason to withhold approval when the Bugbot check passed and no other blocking feedback applies.

## Nit-level feedback

Treat feedback as nit-level when it is about style, formatting, naming preferences, optional refactors, documentation wording, or subjective taste — and does not describe a likely bug, security issue, data loss, or breaking change.

## Blocking feedback

Blocking conditions override all auto-approval criteria, including a green Cursor Bugbot check.

Do not auto-approve when:

- The Cursor Bugbot GitHub check failed or is still pending.
- Cursor Bugbot has open, unresolved comments.
- Other feedback indicates a likely bug, security vulnerability, breaking change, or failed/incorrect behavior.

When findings are ambiguous, prefer not approving — unless the Bugbot check is green, left no comments, and no other blocking feedback applies, in which case approve.
