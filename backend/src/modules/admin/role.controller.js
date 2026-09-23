import Role from '../../models/Role.js';
import { ApiError } from '../../common/utils/logger.js';

export const getAllRoles = async (req, res, next) => {
  try {
    const roles = await Role.findAll();
    res.json(roles);
  } catch (err) {
    next(new ApiError(500, 'Failed to retrieve roles', err.message));
  }
};

export const createRole = async (req, res, next) => {
  try {
    const role = await Role.create(req.body);
    res.status(201).json(role);
  } catch (err) {
    next(new ApiError(500, 'Failed to create role', err.message));
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) {
      throw new ApiError(404, 'Role not found');
    }
    await role.update(req.body);
    res.json(role);
  } catch (err) {
    next(new ApiError(500, 'Failed to update role', err.message));
  }
};

export const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) {
      throw new ApiError(404, 'Role not found');
    }
    await role.destroy();
    res.json({ success: true, message: 'Role deleted successfully' });
  } catch (err) {
    next(new ApiError(500, 'Failed to delete role', err.message));
  }
};
