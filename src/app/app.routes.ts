import {Route} from "@angular/router";
import {canActivateAuthRole} from "@shared/guards/auth-guard";
import {homeRedirectGuard} from "@shared/guards/home-redirect-guard";

export const routes: Route[] = [
  {
    path: "",
    redirectTo: "identity-attributes-info",
    pathMatch: "full",
  },
  {
    path: "main-home",
    canActivate: [homeRedirectGuard],
    component: class {}, // Dummy component necessary to register the route
  },
  {
    path: "identity-attributes-info",
    loadComponent: () =>
      import("./identity-attributes-info/identity-attributes-info.component").then(
        (m) => m.IdentityAttributesInfoComponent
      ),
    canActivate: [canActivateAuthRole],
    data: { roles: ["T1UAR_M"] },
  },
  {
    path: "users",
    loadComponent: () =>
      import("./users/users-information-page/users-information-page.component").then(
        (m) => m.UsersInformationPageComponent
      ),
    canActivate: [canActivateAuthRole],
    data: { roles: ["T1UAR_M"] },
  },
  {
    path: "role-requests-management",
    loadComponent: () =>
      import("./role-requests-management/role-requests-management.component").then(
        (m) => m.RoleRequestsManagementComponent
      ),
    canActivate: [canActivateAuthRole],
    data: { roles: ["T1UAR_M"] },
  },
  {
    path: "role-requests-management/review/:id",
    loadComponent: () =>
      import("./role-requests-management/role-request-review/role-request-review.component").then(
        (m) => m.RoleRequestReviewComponent
      ),
    canActivate: [canActivateAuthRole],
    data: { roles: ["T1UAR_M"] },
  },
  {
    path: "users/edit/:id",
    loadComponent: () =>
      import("./users/edit-user/edit-user.component").then(
        (m) => m.EditUserComponent
      ),
    canActivate: [canActivateAuthRole],
    data: { roles: ["T1UAR_M"] },
  },
  {
    path: "users/edit",
    redirectTo: "users"
  },
  {
    path: "users/new-user",
    loadComponent: () =>
      import("./users/user-creation-page/user-creation-page.component").then(
        (m) => m.UserCreationPageComponent
      ),
    canActivate: [canActivateAuthRole],
    data: { roles: ["T1UAR_M"] },
  },
  {
    path: "my-profile",
    loadComponent: () =>
      import("./users/my-profile/my-profile.component").then(
        (m) => m.MyProfileComponent
      ),
    canActivate: [canActivateAuthRole],
    data: { roles: [] }
  },
  {
    path: "roles",
    loadComponent: () =>
      import("./roles/roles-information-page/roles-information-page.component").then(
        (m) => m.RolesInformationPageComponent
      ),
    canActivate: [canActivateAuthRole],
    data: { roles: ["T1UAR_M"] },
  },
  {
    path: "role/new",
    loadComponent: () =>
      import("./roles/role/role.component").then(
        (m) => m.RoleComponent
      ),
    canActivate: [canActivateAuthRole],
    data: { roles: ["T1UAR_M"] },
  },
  {
    path: "role/:id",
    loadComponent: () =>
      import("./roles/role-detail/role-detail.component").then(
        (m) => m.RoleDetailComponent
      ),
    canActivate: [canActivateAuthRole],
    data: { roles: ["T1UAR_M"] },
  },
  {
    path: "role/edit/:id",
    loadComponent: () =>
      import("./roles/role/role.component").then(
        (m) => m.RoleComponent
      ),
    canActivate: [canActivateAuthRole],
    data: { roles: ["T1UAR_M"] }
  },
  {
    path: "unauthorized",
    loadComponent: () =>
      import("@fe-simpl/landing-page").then((m) => m.UnauthorizedPageComponent)
  },
  {
    path: "error",
    loadComponent: () =>
      import("@fe-simpl/landing-page").then((m) => m.ErrorPageComponent)
  }
];
