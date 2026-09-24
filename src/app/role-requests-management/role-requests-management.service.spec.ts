import { TestBed } from '@angular/core/testing';

import { RoleRequestsManagementService } from './role-requests-management.service';

describe('RoleRequestsManagementService', () => {
  let service: RoleRequestsManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoleRequestsManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
