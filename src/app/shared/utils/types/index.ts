export type Writeable<T> = {
  -readonly [P in keyof T]: T[P] extends object
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    ? T[P] extends Function
      ? T[P]
      : Writeable<T[P]>
    : T[P];
};

export interface Environment {
  production: boolean,
  api_Url: string,
  keycloakConfig_url: string,
  keycloakConfig_realm: string,
  keycloakConfig_clientId: string,
}
