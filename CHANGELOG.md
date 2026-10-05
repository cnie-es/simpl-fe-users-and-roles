## ednel-v1.0.4 (2026-09-16)

> Derivative work by the **EDNEL-RIOJA** project team for **CNIE-ES**, based on the upstream
> fe-users-and-roles `2.11.0` release (commit `e8941cb`). Modified between
> **2026-03-03 and 2026-09-16**, licensed under EUPL-1.2 like the original work. See
> [NOTICE.EDNEL.md](NOTICE.EDNEL.md) for the full modification notice.

### Added (2026-09-16)

- **Descriptions of the EDNEL portal roles**: the twelve `G-` and `P-` roles of the Governance
  Authority realm showed their English Keycloak description, because the translation files had no
  entry for them and `RoleDescriptionPipe` fell back to the description returned by the API. The six
  translation files now carry their strings, keyed by the role code, which for these roles is the
  Keycloak role name, spaces included. The pipe spec covers all twelve against the real
  `TranslocoService` and the actual English bundle, so a key that stops resolving fails the tests.

### Added (2026-09-11)

- **Multilingual role descriptions**: a `RoleDescriptionPipe` resolves each role's description
  from the translation files, with its unit tests, and the role detail, role list and roles
  information views render it. The Spanish, English, Catalan, Basque, Galician and Valencian
  translation files carry the new strings.

### Added (2026-03-03 → 2026-07-09)

- **Additional languages**: Spanish, Catalan, Basque, Galician and Valencian translation files,
  including the missing translations for the EUI components and support for Valencian in the date
  picker, with tests for the language selector.
- **EDNEL branding**: `ednel-full-logo.svg` in the header and a user profile icon, replacing the
  SIMPL logo, together with the EDNEL stylesheet.
- **Home redirect guard** with its tests, and a spec for the EDNEL application component.
- Three **GitHub Actions workflows**: image build and push, pull request checks, and a job that
  syncs this fork from the upstream repository.
- `yarn.lock`, pinning the dependency tree, and removed from `.gitignore` so that it is versioned.

### Changed (2026-03-03 → 2026-07-09)

- **Look and feel**: styles updated to match the prototypes, gaps between buttons, action buttons
  no longer wrapping, the filter panel no longer pushing the table to the right, and a translated
  private area title.
- **Navigation**: home navigation fixed through the new redirect guard.
- Upstream console logs commented out, and SCSS rules documented.

### Removed (2026-07-09)

- `src/assets/images/logo/simpl-logo.svg`, replaced by the EDNEL logo. This is the only file of the
  original work that this fork removes, and it also keeps the licensor's mark out of the published
  interface, which Art. 5 of the EUPL (Legal Protection) asks for.

### Licence compliance (2026-09-11)

Notices required by Art. 5 of the EUPL-1.2 (Attribution right, Provision of Source Code) for this
derivative work:

- `NOTICE.EDNEL.md`: modification notice stating that the work has been modified, by whom, when and
  what was changed, with the repository where the complete corresponding source code is available.
- `README.md`: prominent notice at the top of the file identifying this repository as a modified
  version of fe-users-and-roles, plus a Licence section.
- `LICENSE`: the full official text of the EUPL-1.2 is now reproduced in the file, which previously
  only linked to it, so that a copy of the Licence travels with every copy of the Work. The
  original SIMPL heading is kept intact.
- `Dockerfile`: OCI image labels (`licenses`, `source`, `vendor`, `description`) and `LICENSE` and
  `NOTICE.EDNEL.md` copied into the image, so the notices and the pointer to the source code travel
  with the published container image.
- `package.json`: `description` and `repository` added, so that the source repository is stated in
  the package metadata too.
- `.github/workflows/build-push.yml`: the container image namespace is derived from the repository
  owner instead of being hard-coded, so that the published image and the source code it is built
  from always live in the same organisation.
- Automatic tagging switched off in the same workflow. It bumped the patch and pushed a new
  `ednel-v1.0.x` git tag on every merge to `ednel`, so the released version moved without anyone
  deciding it and drifted from what this changelog, the README, the chart `appVersion` and the
  modification notice declare. The release version is now whatever tag was created on purpose, and
  the image is published under that same tag; the pipeline fails if no release tag exists.
- Helm chart made loadable outside the upstream GitLab pipeline: `Chart.yaml` and `values.yaml`
  carried unsubstituted `${PROJECT_RELEASE_VERSION}` and `${CI_REGISTRY_IMAGE}` placeholders, which
  that pipeline replaced and which made the chart fail to load anywhere else. `image.repository`
  now defaults to the published image of this fork.
- `NOTICE.EDNEL.md` records where the third-party licences travel: this repository ships no
  `NOTICE` or `THIRD_PARTY_LICENCES` file, and the licences of the packages embedded in the Angular
  bundle reach the image as `3rdpartylicenses.txt`, which `angular.json` emits under the default
  `production` configuration.


## 2.7.0 (2025-11-10)

### changed (1 changes)

- Monorepo splitting. Please refer to old [CHANGELOG.md](https://code.europa.eu/simpl/simpl-open/development/iaa/simpl-fe/-/blob/main/CHANGELOG.md) for more details.

