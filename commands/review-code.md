# Review Code
Review service/domain rules, validation, persistence, API errors, frontend error handling, and state-machine enforcement. Compare implementation against `spec/` before accepting changes.

Verify that ticket search is case-insensitive, supports partial matches across title, description, and assignee, handles null assignees safely, and composes correctly with status filtering.
