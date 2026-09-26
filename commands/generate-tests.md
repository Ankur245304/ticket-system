# Generate Tests
Generate tests from `spec/state-machine.md` first, then validation and persistence tests. Do not replace existing negative tests with happy-path-only tests.

For ticket search, cover case-insensitive partial matches against title, description, and assignee. Include an unassigned ticket to verify that nullable assignees do not break search.
