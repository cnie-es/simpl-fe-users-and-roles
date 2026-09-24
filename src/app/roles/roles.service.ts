import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {
  IdentityAttribute,
  Role,
  RolesService as RoleServiceOpenApi
} from '@simpl/api-client-usersroles-tier1-v2';
import {
  IdentityAttributesService, ParticipantsService
} from '@simpl/api-client-authenticationprovider-tier1-v2';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  private readonly _roleDetail: BehaviorSubject<Role | null> = new BehaviorSubject<Role | null>(null);
  private readonly _identityAttributeRoleDetail: BehaviorSubject<IdentityAttribute[] | null> = new BehaviorSubject<IdentityAttribute[] | null>(null);
  private readonly _rolesService = inject(RoleServiceOpenApi)
  private readonly _identityAttributesService = inject(IdentityAttributesService);
  private readonly _participantService = inject(ParticipantsService);
  private readonly _router = inject(Router);

  getRoleList(page?: number, size?: number , sort?: string[], name?: string, code?: string){
    return this._rolesService.searchRoles(page, size, sort, code, null, name)
  }

  getIdentityAttributeList(filters: {page?: number, size?: number, sort?: string[], code?: string, name?: string, assignableToRoles?: boolean, enabled?: boolean, updateTimestampFrom?: string, updateTimestampTo?: string}){
    return this._identityAttributesService.getDataspaceIdentityAttributes(filters.page, filters.size, filters.sort, filters.code, filters.name, filters.assignableToRoles, filters.enabled, filters.updateTimestampFrom, filters.updateTimestampTo)
  }

  getIdentityAttributeParticipants(){
    return this._participantService.getAgentParticipantIdentityAttributes()
  }

  get roleDetail$(): Observable<Role | null>
  {
    return this._roleDetail.asObservable();
  }

  get _identityAttributeRoleDetail$(): Observable<IdentityAttribute[] | null>
  {
    return this._identityAttributeRoleDetail.asObservable();
  }

  getRoleDetail(roleId: string): Observable<Role> {
    return this._rolesService.getRoleById(roleId).pipe(
      tap((res: Role) => {
        this._roleDetail.next(res);
      })
    )
  }

  getRoleIdentityAttributes(roleId: string): Observable<IdentityAttribute[]> {
    return this._rolesService.getRoleIdentityAttributes(roleId).pipe(
      tap((identityAttribute: IdentityAttribute[]) => {
        this._identityAttributeRoleDetail.next(identityAttribute);
      })
    );
  }

  assignIdentityAttributesToARole(id: string, attributes: IdentityAttribute[]): Observable<unknown> {
    return this._rolesService.updateRoleIdentityAttributes(id, attributes)
  }

  createNewRole(role: Role) : Observable<Role> {
    return this._rolesService.createNewRole(role).pipe(
      tap(() => {
        this._router.navigate(['/roles']);
      })
    );
  }

  editRole(roleId: string, role: Role) : Observable<Role> {
    return this._rolesService.updateRoleById(roleId, role);
  }

  deleteRole(roleId: string): Observable<Role> {
    return this._rolesService.deleteRoleById(roleId);
  }
}
