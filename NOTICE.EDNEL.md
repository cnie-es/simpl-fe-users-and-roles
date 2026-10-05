# Modification notice (EUPL 1.2, Art. 5)

**This is a modified version of SIMPL fe-users-and-roles. It is not the original work.**

The original work, fe-users-and-roles, is part of the SIMPL programme (© European Union / SIMPL
Programme) and is licensed under the **European Union Public Licence v. 1.2 (EUPL-1.2)**. See
[LICENSE](LICENSE), where the full official text of the licence is reproduced. All original
copyright, licence and disclaimer notices are kept intact and unmodified in this fork.

### Third-party components

Unlike the other components of this programme, this repository ships no `NOTICE` or
`THIRD_PARTY_LICENCES` file. The published artefact is an Angular bundle, and the licences of the
third-party packages it embeds — which MIT, BSD and Apache all require to accompany a binary
distribution — travel with it as `3rdpartylicenses.txt`: `angular.json` sets `extractLicenses` for
the `production` configuration, which is the default for `ng build`, and the `Dockerfile` copies the
whole `dist` directory into the image. In a running container the file is therefore at
`/usr/share/nginx/html/3rdpartylicenses.txt` and is also served over HTTP.

Note that a build made with `--configuration development` disables `extractLicenses` and would not
carry those notices; release images must be built with the default configuration.

## Upstream baseline

| | |
|---|---|
| Original work | fe-users-and-roles |
| Upstream repository | https://code.europa.eu/simpl/simpl-open/development/iaa/fe-users-and-roles |
| Baseline version | `2.11.0` |
| Baseline commit | `e8941cbb5c74c56e0bcd52228881da09d1b1d795` (2026-02-16) |

## Modifications

| | |
|---|---|
| Modified by | EDNEL-RIOJA project team, for CNIE-ES |
| Public repository of this derivative work | https://github.com/cnie-es/simpl-fe-users-and-roles |
| Version of this derivative work | `ednel-v1.0.4` |
| Dates of modification | **2026-03-03 to 2026-09-16** |

The modifications are licensed under the **EUPL-1.2**, the same licence as the original work.

The complete source code of this derivative work is available at the public repository above as a
vetted release snapshot, and will remain freely available there for as long as the Work is
distributed. The upstream repository and exact baseline commit are recorded above. Each release
snapshot includes `SBOM.cyclonedx.json`, which binds the upstream and work revisions, release tag,
public repository, snapshot hash and image digest. The distribution history contains release
snapshots rather than a copy of the upstream Git history, so the complete set of changes is the
diff between the baseline commit `e8941cb`, fetched from its authoritative upstream repository,
and the published snapshot. The tables below record what each file contributed. The published
container images (`ghcr.io/cnie-es/fe-users-and-roles`) are built from that snapshot.

### Summary of the changes

- **EDNEL branding**: the SIMPL logo was removed and replaced by `ednel-full-logo.svg` in the
  header, with a user profile icon and an EDNEL stylesheet, and the styles reworked to match the
  project prototypes. Removing the licensor's mark from the published interface is also what
  Art. 5 of the EUPL (Legal Protection) asks for.
- **Additional languages**: Spanish, Catalan, Basque, Galician and Valencian translation files,
  the missing translations for the EUI components, Valencian support in the date picker, a
  translated private area title, and tests for the language selector.
- **Multilingual role descriptions** (2026-09-11, 2026-09-16): a `RoleDescriptionPipe` resolves each
  role's description from the translation files, with its unit tests, and the role detail, role list
  and roles information views now render it. The six translation files carry the new strings,
  including those of the twelve `G-` and `P-` EDNEL portal roles of the Governance Authority realm,
  added on 2026-09-16.
- **Layout**: gaps between buttons, action buttons no longer wrapping, and the filter panel no
  longer pushing the table to the right.
- **Navigation**: home navigation fixed through a dedicated redirect guard, with its tests.
- Three **GitHub Actions workflows**: image build and push, pull request checks, and a job that
  syncs this fork from the upstream repository. `yarn.lock` is now versioned and pins the
  dependency tree.

A second, non-functional group of changes (2026-09-11) adds the notices this licence requires of a
derivative work: this file, the notice at the top of [README.md](README.md), the licence and
source-code metadata in `package.json` and in the OCI labels of the `Dockerfile`, and the
reproduction of the full official licence text inside [LICENSE](LICENSE), which previously only
linked to it. See [CHANGELOG.md](CHANGELOG.md) for the itemised list.

### Files added

| File | Date |
|---|---|
| `.github/workflows/build-push.yml` | 2026-03-03,2026-03-06 2026-06-15,2026-09-11 |
| `.github/workflows/pr.yaml` | 2026-06-11 |
| `.github/workflows/sync.yaml` | 2026-03-04 |
| `NOTICE.EDNEL.md` | 2026-09-11,2026-09-16 |
| `src/app/app-ednel.component.spec.ts` | 2026-03-27 |
| `src/app/shared/guards/home-redirect-guard.spec.ts` | 2026-07-09 |
| `src/app/shared/guards/home-redirect-guard.ts` | 2026-07-09 |
| `src/app/shared/pipes/role-description.pipe.spec.ts` | 2026-09-11,2026-09-16 |
| `src/app/shared/pipes/role-description.pipe.ts` | 2026-09-11 |
| `src/assets/i18n/ca.json` | 2026-03-03,2026-03-04 2026-03-06,2026-03-10 2026-03-27,2026-03-30 2026-04-10,2026-04-13 2026-06-02,2026-06-10 2026-06-11,2026-09-11 2026-09-16 |
| `src/assets/i18n/eu.json` | 2026-03-03,2026-03-04 2026-03-06,2026-03-10 2026-03-27,2026-03-30 2026-04-10,2026-04-13 2026-06-02,2026-06-10 2026-06-11,2026-09-11 2026-09-16 |
| `src/assets/i18n/gl.json` | 2026-03-03,2026-03-04 2026-03-06,2026-03-10 2026-03-27,2026-03-30 2026-04-10,2026-04-13 2026-06-02,2026-06-10 2026-06-11,2026-09-11 2026-09-16 |
| `src/assets/i18n/va.json` | 2026-06-10,2026-06-11 2026-09-11,2026-09-16 |
| `src/assets/images/logo/ednel-full-logo.svg` | 2026-07-01 |
| `src/assets/images/user-profile-icon.svg` | 2026-04-24 |
| `yarn.lock` | 2026-04-21 |

### Files modified

| File | Date |
|---|---|
| `.gitignore` | 2026-04-21 |
| `CHANGELOG.md` | 2026-09-11,2026-09-16 |
| `Dockerfile` | 2026-09-11,2026-09-16 |
| `LICENSE` | 2026-09-11 |
| `README.md` | 2026-09-11,2026-09-16 |
| `charts/Chart.yaml` | 2026-09-11 |
| `charts/values.yaml` | 2026-09-11 |
| `package.json` | 2026-09-11 |
| `src/app/app-starter.service.ts` | 2026-03-04,2026-06-10 |
| `src/app/app.component.html` | 2026-03-12,2026-03-30 2026-04-10,2026-04-24 2026-07-01,2026-07-09 |
| `src/app/app.component.ts` | 2026-03-04,2026-03-06 2026-03-27,2026-06-10 2026-06-12 |
| `src/app/app.config.ts` | 2026-03-04,2026-06-10 |
| `src/app/app.routes.ts` | 2026-07-09 |
| `src/app/identity-attributes-info/identity-attributes-info.component.html` | 2026-03-03,2026-03-04 2026-03-06,2026-03-10 2026-04-08,2026-04-17 |
| `src/app/role-requests-management/role-requests-management.component.html` | 2026-03-03,2026-03-06 2026-04-17,2026-04-24 |
| `src/app/roles/role-detail/role-detail.component.html` | 2026-03-03,2026-03-04 2026-03-06,2026-03-10 2026-04-08,2026-04-17 2026-09-11 |
| `src/app/roles/role-detail/role-detail.component.ts` | 2026-09-11 |
| `src/app/roles/role/role.component.html` | 2026-03-03,2026-03-04 2026-03-06,2026-03-10 2026-04-08,2026-04-17 |
| `src/app/roles/role/role.component.ts` | 2026-03-06 |
| `src/app/roles/roles-information-page/roles-information-page.component.html` | 2026-03-04,2026-03-31 2026-04-08,2026-04-09 2026-04-17,2026-09-11 |
| `src/app/roles/roles-information-page/roles-information-page.component.ts` | 2026-03-04,2026-03-31 2026-04-23,2026-09-11 |
| `src/app/shared/filter-chips/filter-chips.component.html` | 2026-03-03 |
| `src/app/shared/filter-chips/filter-chips.component.spec.ts` | 2026-03-04 |
| `src/app/shared/filter-chips/filter-chips.component.ts` | 2026-03-03,2026-03-04 |
| `src/app/shared/pipes/index.ts` | 2026-09-11 |
| `src/app/shared/services/error-handler-interceptor.service.ts` | 2026-03-04,2026-04-23 2026-06-10 |
| `src/app/shared/services/loader-interceptor.ts` | 2026-04-23 |
| `src/app/shared/utils/forms/validators/index.spec.ts` | 2026-06-11 |
| `src/app/shared/utils/forms/validators/index.ts` | 2026-06-11 |
| `src/app/users/edit-user/edit-user.component.html` | 2026-04-13 |
| `src/app/users/my-profile/my-profile.component.html` | 2026-03-04,2026-04-08 2026-04-17,2026-06-02 |
| `src/app/users/my-profile/my-profile.component.ts` | 2026-03-04 |
| `src/app/users/user-creation-page/user-creation-page.component.html` | 2026-06-11 |
| `src/app/users/user-creation-page/user-creation-page.component.spec.ts` | 2026-06-11 |
| `src/app/users/user-creation-page/user-creation-page.component.ts` | 2026-06-11 |
| `src/app/users/users-information-page/role-list-modal/role-list-modal.component.html` | 2026-09-11 |
| `src/app/users/users-information-page/role-list-modal/role-list-modal.component.ts` | 2026-09-11 |
| `src/app/users/users-information-page/users-information-page.component.html` | 2026-03-04,2026-04-08 2026-04-17 |
| `src/app/users/users-information-page/users-information-page.component.ts` | 2026-03-04 |
| `src/assets/i18n/en.json` | 2026-03-03,2026-03-06 2026-03-10,2026-03-27 2026-03-30,2026-04-10 2026-04-13,2026-06-02 2026-06-10,2026-06-11 2026-09-11,2026-09-16 |
| `src/assets/i18n/es.json` | 2026-03-03,2026-03-04 2026-03-06,2026-03-10 2026-03-27,2026-03-30 2026-04-10,2026-04-13 2026-06-02,2026-06-10 2026-06-11,2026-09-11 2026-09-16 |
| `src/config/global.ts` | 2026-03-04,2026-06-10 |
| `src/favicon.ico` | 2026-07-01 |
| `src/index.html` | 2026-03-30,2026-06-09 |
| `src/styles.scss` | 2026-03-12,2026-03-30 2026-04-08,2026-04-10 2026-04-17,2026-04-20 2026-04-24,2026-04-28 2026-04-29,2026-05-04 2026-05-06,2026-05-13 2026-06-09 |

### Files removed

| File | Date |
|---|---|
| `src/assets/images/logo/simpl-logo.svg` | 2026-03-12 |

No copyright, licence or disclaimer notice of the original work has been altered. One file of the
original work was removed, `src/assets/images/logo/simpl-logo.svg`, replaced by the EDNEL logo as
part of the rebranding; nothing else of the original work was removed.

The only change to [LICENSE](LICENSE) is the addition, below the original heading, of the full
official text of the EUPL-1.2 that the file previously referenced only by hyperlink; nothing in the
original file was removed or reworded.

The per-file diff for every change is obtainable with:

```
git diff e8941cbb5c74c56e0bcd52228881da09d1b1d795..ednel
```

For a published image, substitute the release tag it was built from for `ednel`.
