## Users and roles Frontend

### Install on Kubernetes
```shell
helm repo add fe-users-and-roles-charts https://code.europa.eu/api/v4/projects/1310/packages/helm/stable
helm install fe-users-and-roles fe-users-and-roles-charts/fe-users-and-roles \
--version <chart version> \
--values values.yaml
```

> **💡** The latest chart version can be found in the releases section of the project's repository. Please note that hotfixes may have been released since the last major update. Hotfixes may have been released. [Link to releases](https://code.europa.eu/simpl/simpl-open/development/iaa/fe-users-and-roles/-/releases).

#### Example of values.yaml
```yaml
hostFe: fe.<agent-namespace>.fe.dev.simpl-europe.eu # this is an example, update this field
cors: # this is an example, update this field
  allowOrigin: https://t1.<agent-namespace>.dev.simpl-europe.eu,https://users-and-roles.<agent-namespace>.fe.dev.simpl-europe.eu,http://localhost:4202,http://localhost:4203,http://localhost:3000
ingress:
  issuer: dev-prod

env:
- name: API_URL
  value: "https://t1.<agent-namespace>.dev.simpl-europe.eu" # this is an example, update this field
- name: KEYCLOAK_URL
  value: "https://t1.<agent-namespace>.dev.simpl-europe.eu/auth" # this is an example, update this field
- name: KEYCLOAK_REALM
  value: "<authority or participant>" 
- name: KEYCLOAK_CLIENT_ID
  value: "frontend-cli"
```

### Configuration
The configuration provides details on the backend and frontend host URLs, CORS allowed origins, ingress issuer, and environment variables for the onboarding application. For further configuration, view the Helm template and update the values as required.

**Frontend Host Configuration**
  - `hostFe`: The hostname for the frontend service. Value: `my.frontend.host`

**CORS Configuration - Allowed Origins**
  - `cors.allowOrigin`: Specifies the origins that are allowed to access the application resources via cross-origin requests.
    - Value: `https://my.frontend.host, https://<agent-namespace>.fe.aruba-simpl.cloud, http://localhost:4202, http://localhost:4203, http://localhost:3000`

**Ingress Configuration - Issuer**
  - `ingress.issuer`: The issuer for the ingress, which is typically used for managing TLS certificates. Value: `your-issuer-ingress`

**Environment Variables**
  - `API_URL`: The URL for the API backend. Value: `https://my.backend.host`
**Keycloak Configuration**
  - `KEYCLOAK_URL`: The URL for the Keycloak authentication service. Value: `https://my.backend.host/auth`
  - `KEYCLOAK_REALM`: The Keycloak realm that the application uses for authentication. Value: `authority`
  - `KEYCLOAK_CLIENT_ID`: The client ID used by the application to authenticate with Keycloak. Value: `frontend-cli`

