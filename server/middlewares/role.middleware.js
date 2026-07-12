const ROLES = Object.freeze({
    ADMIN: "admin",
    ASSET_MANAGER: "asset_manager",
    DEPARTMENT_HEAD: "department_head",
    EMPLOYEE: "employee",
});

const ROLE_VALUES = Object.values(ROLES);

const normalizeRoles = (roles) => {
    const flattened = roles.flat();

    if (flattened.length === 0) {
        throw new Error("At least one role is required.");
    }

    flattened.forEach((role) => {
        if (!ROLE_VALUES.includes(role)) {
            throw new Error(`Unknown role: ${role}`);
        }
    });

    return flattened;
};

const forbidden = (res, message = "You do not have permission to perform this action.") =>
    res.status(403).json({
        success: false,
        message,
    });

const requireRoles = (...roles) => {
    const allowedRoles = normalizeRoles(roles);

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication is required.",
            });
        }

        if (req.user.role === ROLES.ADMIN || allowedRoles.includes(req.user.role)) {
            return next();
        }

        return forbidden(res);
    };
};

const requireAdmin = requireRoles(ROLES.ADMIN);

const requireAssetManager = requireRoles(ROLES.ASSET_MANAGER);

const requireDepartmentHead = requireRoles(ROLES.DEPARTMENT_HEAD);

const requireManagerRole = requireRoles(
    ROLES.ADMIN,
    ROLES.ASSET_MANAGER,
    ROLES.DEPARTMENT_HEAD
);

const allowSelfOrRoles = (paramName = "id", ...roles) => {
    const allowedRoles = roles.length > 0 ? normalizeRoles(roles) : [];

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication is required.",
            });
        }

        const targetId = req.params[paramName];
        const isSelf = targetId && String(req.user.id) === String(targetId);
        const isPrivileged =
            req.user.role === ROLES.ADMIN || allowedRoles.includes(req.user.role);

        if (isSelf || isPrivileged) return next();

        return forbidden(res);
    };
};

const requireDepartmentScope = (departmentParam = "departmentId") => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication is required.",
        });
    }

    if ([ROLES.ADMIN, ROLES.ASSET_MANAGER].includes(req.user.role)) {
        return next();
    }

    const targetDepartmentId =
        req.params[departmentParam] ||
        req.body?.[departmentParam] ||
        req.query?.[departmentParam];

    if (
        req.user.role === ROLES.DEPARTMENT_HEAD &&
        targetDepartmentId &&
        String(req.user.departmentId) === String(targetDepartmentId)
    ) {
        return next();
    }

    return forbidden(res, "You can only access records for your department.");
};

module.exports = {
    ROLES,
    allowSelfOrRoles,
    authorize: requireRoles,
    requireAdmin,
    requireAssetManager,
    requireDepartmentHead,
    requireDepartmentScope,
    requireManagerRole,
    requireRoles,
};
