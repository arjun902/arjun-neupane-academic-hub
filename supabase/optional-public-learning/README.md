# Optional database publication mode

This SQL was uploaded in remote commits `c66c527` / `aff2996` while the static redesign was in progress. It is preserved here as an **explicit opt-in**, outside automatically applied migrations.

The current public website reads `content/*.ts` and needs none of this SQL. Do not run it merely to deploy GitHub Pages.

Running this file makes existing released/published resources in visible backend courses anonymously readable, including their enabled file objects. Review every eligible resource before opting in. It retains private accounts, grades, submissions, drafts and scheduled files. It does not make the entire Storage bucket public.

The test suite exercises this optional mode after both private migrations, with fresh and legacy fixtures. It has not been applied to a live project. Historical deployment instructions are in `docs/OPEN_ACCESS_DEPLOYMENT.md`; the current static-site instructions in `docs/SETUP.md` take precedence.
