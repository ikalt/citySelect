# 完成 CitySelect MVP 集成验收

## Goal

Complete the final MVP audit, verify every parent acceptance criterion against
current evidence, update durable specs, archive completed tasks, and prepare the
branch for handoff.

## Requirements

- Run the full workspace quality gates from a clean state.
- Run the data validation command.
- Run the demo command or build command.
- Audit every parent-task acceptance criterion with direct evidence.
- Confirm MVP exclusions are documented.
- Archive completed child tasks and then archive the parent task.

## Acceptance Criteria

- [ ] `lint`, `typecheck`, `format:check`, and `test` pass.
- [ ] Data validation passes.
- [ ] Demo command or build command passes.
- [ ] Parent PRD acceptance criteria are all satisfied or explicitly linked to
      evidence.
- [ ] No active Trellis MVP child task remains unfinished.
- [ ] Git status is clean after final commits.

## Notes

- This task runs last and should not start until earlier child tasks are done.
