type ValidateUserPermissionsParams = {
  user: User;
  permissions?: string[];
  roles?: string[];
};

type User = {
  permissions: string[];
  roles: string[];
};

export function validateUserPermissions({
  user,
  permissions,
  roles,
}: ValidateUserPermissionsParams) {
  if (permissions!?.length > 0) {
    // if the user has all permissions

    const hasAllPermissions = permissions?.every((permission) => {
      return user.permissions?.includes(permission);
    });

    if (!hasAllPermissions) {
      return false;
    }
  }

  if (roles!?.length > 0) {
    const hasAllRoles = roles?.some((role) => {
      return roles.includes(role);
    });

    if (!hasAllRoles) {
      return false;
    }
  }
}
