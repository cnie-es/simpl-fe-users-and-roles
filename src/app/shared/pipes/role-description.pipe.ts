import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

/**
 * Minimal shape needed to resolve a role description. Matches the `Role` models
 * exposed by the users-roles API clients without coupling this pipe to them.
 */
export interface RoleDescriptionSource {
  code?: string;
  description?: string;
}

export const ROLE_DESCRIPTIONS_SCOPE = 'roleDescriptions';

/**
 * EDNEL: renders the description of a role in the active language.
 *
 * Built-in roles are seeded in the users-roles database from the Keycloak realm
 * export, so their description is a fixed English string. This pipe looks up
 * `roleDescriptions.<CODE>` in the i18n bundle and falls back to the description
 * returned by the API for roles that have no translation (custom roles created
 * by a Tier 1 administrator).
 *
 * Impure so that it re-evaluates when the active language changes.
 */
@Pipe({
  name: 'roleDescription',
  standalone: true,
  pure: false
})
export class RoleDescriptionPipe implements PipeTransform {

  readonly #translocoService = inject(TranslocoService);

  transform(role: RoleDescriptionSource | null | undefined): string {
    if (!role) {
      return '';
    }

    const fallback = this.#removePlaceholder(role.description);

    if (!role.code) {
      return fallback;
    }

    const key = `${ROLE_DESCRIPTIONS_SCOPE}.${role.code}`;
    const translation = this.#translocoService.translate<string>(key);

    return !translation || translation === key ? fallback : translation;
  }

  /**
   * Keycloak built-in roles carry descriptions such as `${role_default-roles}`,
   * which are message-bundle keys resolved by the Keycloak admin console only.
   * Strip the wrapping so they are not shown verbatim.
   */
  #removePlaceholder(description: string | undefined): string {
    if (!description) {
      return '';
    }
    return description.replace(/^\$\{(.+)}$/, '$1');
  }
}
