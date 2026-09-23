
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Staff, Admin, Student, Role } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

export const configurePassport = (passport) => {
  passport.use(
    new JwtStrategy(options, async (jwt_payload, done) => {
      try {
        const id = parseInt(jwt_payload.id);
        const { registry } = jwt_payload;
        console.log(`[Passport] Verifying Token for ID: ${id}, Registry: ${registry}, Role: ${jwt_payload.role}`);
        
        let user = null;
        if (registry === 'ADMIN') {
          user = await Admin.findByPk(id, {
            include: [{ model: Role, as: 'dynamicRole' }]
          });
        } else if (registry === 'STAFF') {
          user = await Staff.findByPk(id, {
            include: [{ model: Role, as: 'dynamicRole' }]
          });
        } else if (registry === 'STUDENT') {
          user = await Student.findByPk(id);
        } else {
          // Fallback for legacy tokens
          user = await Admin.findByPk(id, { include: [{ model: Role, as: 'dynamicRole' }] });
          if (!user) user = await Staff.findByPk(id, { include: [{ model: Role, as: 'dynamicRole' }] });
          if (!user) user = await Student.findByPk(id);
        }

        if (user) {
          // Normalize user object for middleware
          const userPlain = user.get ? user.get({ plain: true }) : user;
          
          // Safer role derivation: use jwt_payload.role as ultimate source of truth, especially for STUDENT
          userPlain.role = (jwt_payload.role || userPlain.role || user.dynamicRole?.name || 'STAFF').toUpperCase().trim();
          userPlain.id = id; // Ensure ID is consistent
          
          console.log(`[Passport] Authorized: ${userPlain.name} as ${userPlain.role}`);
          return done(null, userPlain);
        }
        
        console.warn(`[Passport] No user found for ID: ${jwt_payload.id}`);
        return done(null, false);
      } catch (error) {
        console.error("[Passport Strategy] Critical Auth Error:", error.message);
        return done(error, false);
      }
    })
  );
};
