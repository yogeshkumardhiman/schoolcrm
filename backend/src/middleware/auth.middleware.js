import passport from 'passport';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  console.log(`[Auth Middleware] Received Header: ${authHeader ? (authHeader.substring(0, 20) + '...') : 'MISSING'}`);

  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      console.error("[Auth Middleware] Passport Error:", err.message);
      return res.status(500).json({ error: 'Internal Authentication Error' });
    }
    if (!user) {
      console.warn(`[Auth Middleware] Authentication Failed. Info: ${info?.message || 'No info'}`);
      return res.status(401).json({ 
        error: 'Invalid Session: Security mismatch.', 
        detail: info?.message || 'The institutional token has expired or is malformed. Please re-authenticate.' 
      });
    }
    // Passport sets req.user to the full user object from DB
    req.user = user;
    next();
  })(req, res, next);
};

export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    const rawRole = req.user?.role || '';
    const userRole = rawRole.toUpperCase().replace(/\s+/g, '_').trim();
    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase().replace(/\s+/g, '_').trim());

    console.log(`[Authorize] Checking access. User Role: ${userRole}, Allowed: ${normalizedAllowed.join(', ')}`);
    
    // 1. Super Admin always has full access (broad match)
    if (
      userRole === 'SUPER_ADMIN' || 
      userRole.includes('SUPER') || 
      userRole === 'ADMIN' ||
      req.user?.permissions?.isSuperAdmin
    ) {
        console.log(`[Authorize] Access GRANTED for SUPER_ADMIN / ADMIN`);
        return next();
    }

    // 2. Check if the user's role is explicitly allowed for this route
    if (userRole && normalizedAllowed.includes(userRole)) {
        console.log(`[Authorize] Access GRANTED for Role: ${userRole}`);
        return next();
    }

    console.error(`[Authorize Error] Access DENIED. User Role: ${rawRole}, Allowed Roles: ${allowedRoles.join(', ')}`);
    res.status(403).json({ 
      error: `Forbidden: Lack of authority for this operation. Current Role: "${rawRole}" (Required: ${allowedRoles.join(', ')})`,
      detail: `Access restricted for role: ${rawRole}. Required roles: ${allowedRoles.join(', ')}`
    });
  };
};

export const canManageAppSettings = (req, res, next) => {
  const rawRole = req.user?.role || '';
  const userRole = rawRole.toUpperCase().replace(/\s+/g, '_').trim();
  const canManage = req.user?.can_manage_app_settings === true;
  
  console.log(`[canManageAppSettings] User: ${req.user?.name || req.user?.email}, Role: ${userRole}, can_manage_app_settings: ${canManage}`);
  
  if (
    userRole === 'SUPER_ADMIN' || 
    userRole.includes('SUPER') || 
    userRole === 'ADMIN' ||
    req.user?.permissions?.isSuperAdmin ||
    canManage
  ) {
    console.log(`[canManageAppSettings] Access GRANTED`);
    return next();
  }
  
  console.error(`[canManageAppSettings Error] Access DENIED. User Role: ${rawRole}, can_manage_app_settings: ${canManage}`);
  return res.status(403).json({
    error: 'Forbidden: You do not have permissions to manage app settings.',
    detail: 'This action is restricted to Administrators and authorized staff members only.'
  });
};
