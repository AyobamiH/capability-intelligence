---
schema: clawsweeper.project-vision.v1
project_id: capability-intelligence
repository: AyobamiH/capability-intelligence
---

# Project Vision

## Identity

Capability Intelligence is a standalone, local-first capability inventory and agent-decision-support product.

## Purpose

Answer what capabilities are present or discoverable, what lifecycle state they are actually in, and what authority, dependencies, risks, and evidence gaps would be involved in using them.

## Owns

- Allowlisted local capability discovery and inventory.
- Lifecycle-state representation from discovered through verified.
- Deterministic search, inspection, diagnostics, host comparison, and redacted export.
- Bounded advisory recommendations and explicit evidence gaps.
- Read-only local API/dashboard surfaces for the same truth model.

## Does Not Own

- Autonomous workflow execution.
- Automatic installation, enablement, authentication, or capability invocation.
- OpsTruth-style engineering verification.
- A generic capability broker or multi-agent control plane without a separate product decision.

## Non-Negotiable Invariants

- Metadata is evidence, not proof that a capability works.
- Unknown and not-applicable remain first-class states.
- Default scanning is local, allowlisted, privacy-preserving, and non-networked.
- Credentials, sessions, memories, attachments, shell snapshots, and arbitrary private configuration stay outside inventory.
- Recommendation is advisory and never becomes implicit authority to execute.
- Product direction is driven by the product contract, maturity evidence, backlog, and durable decisions.

## Evidence of Done

A capability claim is done only when its source and lifecycle evidence justify that exact state. A discovered or installed artifact must never be silently promoted to authenticated, runnable, or verified.

## Relationships

- coding-agent-skills may be one allowlisted metadata source; it is not a runtime dependency.
- OpsTruth is a separate verification product.

## Canonical Sources

AGENTS.md, docs/product-contract.md, docs/MATURITY.md, docs/BACKLOG.md, docs/product-decisions.md, and README.md.

## Agent Rule

Keep capability truth descriptive and evidence-backed. Never turn inventory or recommendation into execution authority.
