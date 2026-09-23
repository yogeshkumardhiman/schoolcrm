import { defineAbilityFor } from '../config/ability.js';
import { Staff, Role, Admin } from '../models/index.js';


export const checkAbility = (action, subject) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthenticated' });

      let user = null;
      
      // Determine if the user is likely an Admin based on the request path or role hint
      const isAdminRoute = req.originalUrl.includes('/admin/');
      
      if (isAdminRoute && req.user.role?.toUpperCase().includes('ADMIN')) {
          try {
              user = await Admin.findByPk(req.user.id, {
                  include: [{ model: Role, as: 'dynamicRole' }]
              });
          } catch (e) {
              user = await Admin.findByPk(req.user.id);
          }
      }

      if (!user) {
          user = await Staff.findByPk(req.user.id, {
              include: [{ model: Role, as: 'dynamicRole' }]
          });
      }

      if (!user && !isAdminRoute) {
          try {
              user = await Admin.findByPk(req.user.id);
          } catch (e) {}
      }

      if (!user) return res.status(404).json({ error: 'Identity mismatch: User not found in institutional registry' });

      const ability = defineAbilityFor(user);

      if (ability.can(action, subject)) {
        req.ability = ability;
        return next();
      }

      res.status(403).json({ error: `Forbidden: Cannot ${action} ${subject}` });
    } catch (err) {
      console.error("[Ability Error]:", err);
      res.status(500).json({ error: 'Internal Auth Error' });
    }
  };
};
