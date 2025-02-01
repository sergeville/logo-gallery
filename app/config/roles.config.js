"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRolePermissions = exports.hasPermission = exports.ROLE_PERMISSIONS = exports.ROLES = exports.DEFAULT_ROLE = void 0;
exports.DEFAULT_ROLE = 'user';
exports.ROLES = {
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    USER: 'user',
    GUEST: 'guest',
};
exports.ROLE_PERMISSIONS = (_a = {},
    _a[exports.ROLES.ADMIN] = ['*'],
    _a[exports.ROLES.MODERATOR] = ['read', 'write', 'delete', 'moderate'],
    _a[exports.ROLES.USER] = ['read', 'write'],
    _a[exports.ROLES.GUEST] = ['read'],
    _a);
function hasPermission(userRole, permission) {
    var _a;
    return ((_a = exports.ROLE_PERMISSIONS[userRole]) === null || _a === void 0 ? void 0 : _a.includes(permission)) || false;
}
exports.hasPermission = hasPermission;
function getRolePermissions(role) {
    return exports.ROLE_PERMISSIONS[role] || [];
}
exports.getRolePermissions = getRolePermissions;
