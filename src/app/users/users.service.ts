import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  Role,
  RoleAssignmentRequest, RolesService, User, UsersService as UsersServiceOpenApiV2
} from '@simpl/api-client-usersroles-tier1-v2';

@Injectable({ providedIn: 'root' })
export class UsersService {

  private readonly _usersServiceV2 = inject(UsersServiceOpenApiV2);
  private readonly _rolesService = inject(RolesService);

  getUserList(
    page: number | undefined = undefined,
    pageSize: number | undefined = undefined,
    firstName?: string,
    lastName?: string,
    username?: string,
    email?: string
  ) {
    return this._usersServiceV2.searchUsers(page, pageSize, firstName, lastName, username, email);
  }

  getUserRoles(id: string): Observable<Role[]> {
    return this._usersServiceV2.getUserRoles(id);
  }

  createUser(user: User): Observable<User> {
    return this._usersServiceV2.createNewUser(user);
  }

  getAllRoles() {
    return this._rolesService.searchRoles(null,null,null,null,null,null,null,null,true).pipe(
      map((response) => response.items),
    )
  }

  updateUserRoles(id: string, roles: RoleAssignmentRequest) {
    return this._usersServiceV2.updateUserRoles(id, roles);
  }

  deleteUser(id: string) {
    return this._usersServiceV2.deleteUserById(id);
  }
}
