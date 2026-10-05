# fe-users-and-roles

> ⚠️ **Modified work — CNIE-ES fork.**
> This repository is **not** the original SIMPL fe-users-and-roles. It is a derivative work based
> on the upstream `2.11.0` release (commit `e8941cb`,
> [upstream](https://code.europa.eu/simpl/simpl-open/development/iaa/fe-users-and-roles)),
> modified by the EDNEL-RIOJA project team for CNIE-ES between **2026-03-03 and 2026-09-16**.
> Released as `ednel-v1.0.4` under the **EUPL-1.2**, the same licence as the original work. Full
> details of what was changed and when: [NOTICE.EDNEL.md](NOTICE.EDNEL.md).

## 📑 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [⚡ Quick Start](#-quick-start)
- [Run Locally](#run-locally)
4. [Installation guide](#installation-guide)
5. [User Guide](#user-guide)
6. [Testing](#testing)
8. [Contact & Support](#contact--support)

---

## Overview

Allows the organization to manage users and roles within the Simpl-Open agent.

- Roles management.
- Users management.
- Allows to assign participant identity attributes to user roles.

---

## Prerequisites

The project is tested against the following toolchain versions. Using different major versions may lead to build issues.

| Tool | Required / Tested Versions | Notes |
|------|----------------------------|-------|
| Node.js | ^18.19.1 OR ^20.11.1 OR >=22.0.0 (recommended: 20.11.1 LTS)|
| Yarn (Classic) | >=1.22.4 <2 (1.x only) | Yarn 2+/Berry is NOT supported. |
| Git | >=2.30.0 | Source control. |
| Java | 17+ (optional) | Needed only for `sonar-scanner` & some OpenAPI generator tasks. |
| Docker | Latest stable (optional) | For container builds via provided `Dockerfile`. |
| Browser | Latest Chrome / Edge / Firefox | For local development & testing. |

### Install / Verify

1. Install Node using nvm (recommended across environments):
   ```bash
   # install nvm if not present
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   # load nvm (add these lines to ~/.zshrc to make it persistent)
   export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
   # install and use the recommended LTS version
   nvm install 20.11.1
   nvm use 20.11.1
   # verify
   node -v   # should show v20.11.1 (or a compatible allowed version)
   ```
   If you change Node version later:
   ```bash
   nvm install <version>
   nvm use <version>
   yarn install  # to realign dependencies
   ```

2. Install Yarn Classic (if missing):
   ```bash
   npm install -g yarn@1
   yarn -v  # should be 1.22.x
   ```
3. (Optional) Java for Sonar/OpenAPI:
   ```bash
   brew install openjdk@17
   java -version
   ```

4. (Optional) Docker Desktop for container builds.

### Environment Tips

- Memory-intensive builds: you can increase Node heap if needed:
  ```bash
  export NODE_OPTIONS="--max_old_space_size=4096"
  ```
- Always use Yarn (NOT npm) to respect resolutions & overrides defined in `package.json`.
- If you switch Node versions, run a fresh `yarn install`.

---

## ⚡ Quick Start

### Run Locally

To quickly run the service locally for development or testing, follow these steps:

1. **Install dependencies**

   ```bash
   yarn install
   ```
   This command will install all required dependencies for the project.

2. **Serve**

   ```bash
   ng serve
   ```

3. **Access the application**

   Open your browser and navigate to the URL provided in the terminal (usually `http://localhost:4202`).

---

## Installation guide

For the user guide, please refer to the navigation of the `documents/instalaltion-guide`,  `documents/deployment-guide`, `documents/upgrade-guide`folder.

- [`deployment-guide`](documents/deployment-guide)
- [`installation-guide`](documents/installation-guide)
- [`upgrade-guide`](documents/upgrade-guide)

---

## User guide

For the user guide, please refer to the navigation of the `documents/user-manual` folder.

- [`user-manual`](documents/user-manual)

---

## Testing

This monorepo uses **Jest** for unit tests. (E2E testing with Cypress is currently not in scope for this repository.)

### Unit Tests (Jest)

Run all unit tests:
```bash
npm run test
```

Run all unit tests with coverage:
```bash
npm run test:ci
```

This expands to:
```bash
jest --coverage --passWithNoTests
```
`passWithNoTests` is enabled to avoid failing pipelines if a project temporarily has no test files.

### Test File Naming
Place test files next to implementation using one of:
```
*.spec.ts
*.test.ts
```
They are automatically discovered because Nx passes project roots to Jest.

### Skipping / Focusing Tests
- Use `describe.skip` / `it.skip` to temporarily disable.
- Use `describe.only` / `it.only` during local focus (never commit `.only`).

### Common Troubleshooting
- Out-of-memory: set `NODE_OPTIONS="--max_old_space_size=4096"`.
- No tests found: ensure at least one `*.spec.ts` file exists or rely on `passWithNoTests` for CI.

---

## Contact & Support

- **Issue Tracker**: Please submit your issues and feature requests via the GitLab issue tracker of the repository.
- **Support**: cnect-simpl@ec.europa.eu

---

📌 _This README is part of the **Simpl-Open** project documentation standards. Every component
repository should maintain an up-to-date README covering the sections above._


## Licence

The original work, fe-users-and-roles, is © European Union / SIMPL Programme and is licensed under
the **European Union Public Licence v. 1.2 (EUPL-1.2)**, whose full official text is reproduced in
[LICENSE](LICENSE).

This fork is a **modified version** of that work, distributed under the same licence. The
modification notice required by Art. 5 of the EUPL (what was modified, by whom and when) is in
[NOTICE.EDNEL.md](NOTICE.EDNEL.md). The complete corresponding source code, including the revision
history, is available at https://github.com/cnie-es/simpl-fe-users-and-roles.

---
