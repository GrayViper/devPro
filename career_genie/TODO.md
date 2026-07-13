# CareerGenie Project TODO

## Completed

- [x] Run lint
- [x] Build project
- [x] Run CI tests successfully
- [x] Report results
- [x] Install compatible coverage reporter
- [x] Create and maintain workflow documentation file
- [x] Add resume analysis benchmark suite
- [x] Implement async resume processing and background caching
- [x] Remove Redis dependency and keep in-process resume workflow
- [x] Harden authentication middleware and JWT settings
- [x] Add `SECURITY.md` security checklist
- [x] Increase bcrypt cost factor for password hashing
- [x] Add secure response headers in mock server
- [x] Security: Enforce HTTPS or add HTTPS redirect middleware (best in production proxy)
- [x] Security: Verify JWT handling and implement secret rotation policy
- [x] Security: Ensure password hashing (bcrypt) is enforced and add security tests
- [x] Security: Harden CORS/origin restrictions, secure headers, and auth middleware

## Remaining

- [ ] Availability: Add health checks and runtime monitoring endpoints
- [ ] Availability: Implement backup/recovery guidance for mock data persistence
- [ ] Scalability: Add load testing and capacity planning for the mock backend
- [ ] Scalability: Add database indexing or persistence strategy for production readiness
- [ ] Investigate/implement TCP server for background processing
- [ ] Tech: Frontend — React.js + Tailwind CSS
- [ ] Tech: Backend — Node.js + Express.js
- [ ] Tech: Database — MongoDB
- [ ] Tech: Authentication — JWT + Bcrypt
- [ ] Tech: AI — Python NLP / OpenAI API integration
- [ ] Tech: Deployment — Vercel + Render

## Notes

- In production, `NODE_ENV=production` and `JWT_SECRET` must be defined.
- Dev-only fallback auth is gated by `ALLOW_DEV_AUTH=1`.
- `server/mock-server.js` now sets hardening headers and requires a strong secret when deployed.

## Update process

- Whenever any task is completed, move it from the `Remaining` section to the `Completed` section.
- When a project change is made, add a corresponding entry to `docs/WORKFLOW_LOG.md` with the date and a short description.
- Keep this file and `docs/WORKFLOW_LOG.md` in sync: every completed task must be reflected in both places.
- If a new task is added, append it to the `Remaining` section and mention it in the workflow log.
