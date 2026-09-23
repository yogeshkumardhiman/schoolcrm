import { AbilityBuilder, createMongoAbility } from '@casl/ability';

export const defineAbilityFor = (user) => {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  const role = user.role?.toUpperCase().replace(/\s+/g, '_').trim();

  // 1. Super Admin: Absolute Power
  if (role === 'SUPER_ADMIN' || user.permissions?.isSuperAdmin) {
    can('manage', 'all');
  } else {
    // 2. Individual Permissions (Directly assigned to Staff)
    if (user.permissions && Array.isArray(user.permissions)) {
      user.permissions.forEach(rule => {
        can(rule.action, rule.subject, rule.conditions || {});
      });
    }

    // 3. Role-based Permissions (Inherited from dynamic Role entity)
    if (user.dynamicRole && user.dynamicRole.rules && Array.isArray(user.dynamicRole.rules)) {
      user.dynamicRole.rules.forEach(rule => {
        can(rule.action, rule.subject, rule.conditions || {});
      });
    }
    
    // 4. Default baseline permissions for all authenticated staff
    can('read', 'StaffProfile', { id: user.id });
    can('update', 'StaffProfile', { id: user.id });

    // 5. Hardcoded role overrides for stability
    if (role === 'ACCOUNTANT') {
      can('read', 'Financials');
      can('manage', 'Financials');
      can('read', 'Salary');
      can('manage', 'Salary');
    }
    if (role === 'PRINCIPAL' || role === 'VICE_PRINCIPAL' || role === 'MANAGEMENT') {
      can('read', 'Financials');
      can('read', 'Salary');
      can('read', 'Staff');
      can('read', 'Substitution');
      can('manage', 'Substitution');
    }
    if (role === 'ADMIN') {
      can('manage', 'all');
    }
  }

  return build();
};
