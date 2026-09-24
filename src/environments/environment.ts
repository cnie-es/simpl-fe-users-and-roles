export const environment = {
    production: false,
    api_Url: window["env"]["api_Url"] ?? "default",
    keycloakConfig_url: window["env"]["keycloakConfig_url"],
    keycloakConfig_realm: window["env"]["keycloakConfig_realm"],
    keycloakConfig_clientId: window["env"]["keycloakConfig_clientId"],
};
