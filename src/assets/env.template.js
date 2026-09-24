(function(window) {
  window.env = window.env || {};

  // Environment variables
  window["env"]["api_Url"] = "${API_URL}";
  window["env"]["keycloakConfig_url"] ="${KEYCLOAK_URL}";
  window["env"]["keycloakConfig_realm"] = "${KEYCLOAK_REALM}";
  window["env"]["keycloakConfig_clientId"] ="${KEYCLOAK_CLIENT_ID}";

})(this);
