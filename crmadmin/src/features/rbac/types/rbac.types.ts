export interface Permission {
  id: number;
  code: string;
  name: string;
  module: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions?: Permission[];
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissionCodes: string[];
}

export interface AssignPermissionsPayload {
  roleId: string;
  permissionCodes: string[];
}
