# Documentation and Delivery Workflow

This structure creates a large, durable product knowledge base that both humans and coding agents can use. It separates original business truth, maintained product documentation, implementation-ready specifications, live delivery status, and reusable agent rules.

## File Structure

```text
.
├── Product/
│   ├── Drafted Planning/             # Protected original specifications and workbooks
│   ├── Docs/                         # Large product knowledge base
│   │   ├── 1-Overview/               # Vision, scope, users, glossary, roadmap/status
│   │   ├── 2-Business/               # Rules, processes, requirements, roles, KPIs, decisions
│   │   ├── 3-Features/               # Feature index, module catalogues, workflows
│   │   ├── 4-Technicals/             # Backend, frontend, database, API and security plans
│   │   ├── 5-Architecture/           # Architecture views and decision records
│   │   ├── 6-QA-Testing/             # QA, automation, performance, security and UAT
│   │   ├── 7-DevOps-Release/         # Environments, CI/CD, operations and releases
│   │   ├── 8-Skills/                 # Role-based agent skills and procedures
│   │   └── 9-Design/                 # Design system, screens and accessibility
│   └── Design/
│       ├── docs/                      # Design brief, foundations, components and handover
│       ├── docs/research/             # Screen and requirement research
│       ├── docs/screen-specs/         # One specification per screen or surface
│       ├── screens/                   # Executable screen prototypes
│       └── tokens/                    # Machine-readable design tokens
│
├── docs/                              # Implementation-ready documentation
│   ├── README.md                      # Index and reading order
│   ├── conventions.md                 # Rules inherited by every implementation document
│   ├── mapping.md                     # Business term → module, table, enum and code name
│   ├── business-rules.md              # Enforceable rules with source references
│   ├── workflows.md                   # End-to-end flows and state machines
│   ├── schema.json                    # Logical machine-readable schema authority
│   ├── enums.md                       # Generated enum catalogue
│   ├── erd.md                         # Generated relationship diagrams
│   ├── database.md                    # Physical storage and migration rules
│   ├── testing.md                     # Tests, fixtures, isolation and CI gates
│   ├── modules/                       # One implementation contract per module
│   ├── api/                           # API tiers, endpoints, envelopes and errors
│   ├── Specs/
│   │   ├── README.md                  # Specification index and dependency order
│   │   ├── SP-NN-*.md                 # One fixed-template spec per capability
│   │   ├── DECISIONS.md               # Settled rulings
│   │   ├── CONFLICTS.md               # Cross-source disagreements and resolutions
│   │   └── TRACEABILITY.md            # Spec ↔ module ↔ schema ↔ screen map
│   ├── plans/                         # Detailed feature plans
│   ├── tools/                         # Schema validation and documentation generators
│   ├── EXECUTION_PLAN.md              # Dependency order and delivery gates
│   ├── STATUS.md                      # Live task and approval tracker
│   ├── GAPS_AND_QUESTIONS.md          # Missing, ambiguous or provisional rules
│   └── PROVENANCE.md                  # Authority and documentation-sync rules
│
└── .claude/skills/                    # Reusable role and workflow instructions for agents
```

## What Each Layer Owns

- **Drafted Planning** is protected source material. Read and cite it, but record corrections elsewhere instead of silently rewriting it.
- **Product Docs** is the comprehensive knowledge base covering business, features, architecture, engineering, QA, release, design, and role guidance.
- **Implementation Docs** turns product knowledge into buildable contracts: modules, APIs, rules, schema, tests, and specifications.
- **Specifications** define outcomes, acceptance rules, data, APIs, permissions, states, design surfaces, and unresolved questions.
- **Decisions, conflicts, and gaps** preserve disagreements and prevent an agent from inventing whichever answer is convenient.
- **Execution Plan** defines dependency order and mandatory gates.
- **Status** records what is built, tested, reviewed, merged, blocked, or awaiting approval.
- **Provenance** identifies the authoritative repository and prevents mirrored documentation from drifting.
- **Skills** define how specialised agents work without mixing procedural instructions into product truth.

## Knowledge-Base Workflow

```text
Original specifications, workbooks and approved references
  ↓
Build the product knowledge base by domain and professional role
  ↓
Audit for gaps, contradictions, assumptions and open decisions
  ↓
Record decisions and conflicts without deleting their history
  ↓
Write capability specifications using a fixed template
  ↓
Map every spec to modules, schema tables, APIs, tests and design screens
  ↓
Generate implementation-ready module and API documentation
  ↓
Validate schema and regenerate derived enums and diagrams
  ↓
Create the execution plan in dependency order
  ↓
Track implementation, tests, review, approval and merge in STATUS.md
  ↓
Update documentation and rerun consistency checks with every behavior change
```

## Feature Delivery Loop

```text
Branch
  → Build from the governing spec and module contract
  → Run formatting, static analysis, forbidden-pattern, schema and generator gates
  → Present the diff and evidence for human approval
  → Commit only after approval
  → Run feature, state-machine, security, isolation and regression tests
  → Fix, show, approve, commit and retest until green
  → Check the definition of done
  → Obtain owner review
  → Merge through CI
  → Update STATUS.md and continue in dependency order
```

## Status Model

- `✅ Done` — implemented, verified, approved and merged
- `🟡 In progress` — active work with a named next action
- `⬜ Not started` — planned but untouched
- `⛔ Blocked` — waiting on a named dependency or decision
- `🔬 Awaiting review` — implementation complete but not approved
- `👍 Approved` — reviewed and accepted
- `🔧 Changes requested` — review found required changes

Track implementation, tests, and the final done-gate separately. Code existing does not mean the work is complete.

## Governance Rules

1. Define source precedence and follow it when documents disagree.
2. Never turn an assumption or recommended default into a confirmed rule silently.
3. Keep protected source documents unchanged; record corrections in decision or conflict registers.
4. Human-controlled document status never advances automatically.
5. Product rules govern behavior; approved design references govern appearance.
6. Treat the machine-readable schema as logical authority and generate derived catalogues from it.
7. Never hand-edit generated enum or relationship documentation.
8. Keep authored product docs and implementation-repository copies identical through an automated sync check.
9. Update specs, module docs, status, gaps, and tests in the same change as behavior.
10. Preserve decision history so later contributors understand why the current rule exists.

## Building a Large Knowledge Base

Do not create one giant document. Build hundreds of small, linked documents with indexes, fixed templates, stable identifiers, source citations, ownership, status, and reading orders by role. A new developer or coding agent should be able to move from product intent to a specific rule, feature, state transition, schema table, endpoint, screen, test, decision, and delivery status without rediscovering the system from code.
