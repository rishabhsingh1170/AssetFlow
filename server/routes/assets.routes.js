const express = require("express");
const router = express.Router();

const assetController = require("../controller/asset.controller");
const validate = require("../middlewares/validate.middleware");
const { asset } = require("../validations");
const {
    dateTime,
    oneOf,
    optional,
    string,
    uuid,
} = require("../validations/common.validation");

router.get("/", validate(asset.listAssets), assetController.getAllAssets);

router.get("/:id", validate(asset.idParam), assetController.getAssetById);

router.post("/", validate(asset.createAsset), assetController.createAsset);

router.put("/:id", validate(asset.updateAsset), assetController.updateAsset);

router.delete("/:id", validate(asset.idParam), assetController.deleteAsset);

router.post(
    "/:id/allocate",
    validate({
        params: asset.idParam.params,
        body: {
            fields: {
                holderType: [optional(oneOf(["employee", "department"], "Holder type"))],
                holderUserId: [optional(uuid("Holder user ID"))],
                userId: [optional(uuid("User ID"))],
                holderDepartmentId: [optional(uuid("Holder department ID"))],
                departmentId: [optional(uuid("Department ID"))],
                allocatedBy: [optional(uuid("Allocated by user ID"))],
                expectedReturnAt: [optional(dateTime("Expected return time"))],
            },
            rules: [
                (data) => {
                    const holderType =
                        data.holderType ||
                        (data.holderDepartmentId || data.departmentId
                            ? "department"
                            : "employee");

                    if (
                        holderType === "employee" &&
                        !data.holderUserId &&
                        !data.userId
                    ) {
                        return "Asset allocation requires holderUserId or userId.";
                    }

                    if (
                        holderType === "department" &&
                        !data.holderDepartmentId &&
                        !data.departmentId
                    ) {
                        return "Department allocation requires holderDepartmentId or departmentId.";
                    }

                    return null;
                },
            ],
        },
    }),
    assetController.allocateAsset
);

router.post(
    "/:id/return",
    validate({
        params: asset.idParam.params,
        body: {
            fields: {
                returnReceivedBy: [optional(uuid("Return receiver user ID"))],
                checkinCondition: [
                    optional(
                        oneOf(
                            ["new", "good", "fair", "poor", "damaged"],
                            "Check-in condition"
                        )
                    ),
                ],
                checkinNotes: [optional(string("Check-in notes", { max: 2000 }))],
            },
        },
    }),
    assetController.returnAsset
);

router.post(
    "/:id/transfer",
    validate({
        params: asset.idParam.params,
        body: {
            fields: {
                fromAllocationId: [optional(uuid("From allocation ID"))],
                requestedBy: [optional(uuid("Requested by user ID"))],
                targetHolderType: [
                    optional(oneOf(["employee", "department"], "Target holder type")),
                ],
                targetUserId: [optional(uuid("Target user ID"))],
                userId: [optional(uuid("User ID"))],
                targetDepartmentId: [optional(uuid("Target department ID"))],
                departmentId: [optional(uuid("Department ID"))],
                reason: [optional(string("Reason", { max: 1000 }))],
            },
            rules: [
                (data) => {
                    const targetHolderType =
                        data.targetHolderType ||
                        (data.targetDepartmentId || data.departmentId
                            ? "department"
                            : "employee");

                    if (
                        targetHolderType === "employee" &&
                        !data.targetUserId &&
                        !data.userId
                    ) {
                        return "Transfer request requires targetUserId or userId.";
                    }

                    if (
                        targetHolderType === "department" &&
                        !data.targetDepartmentId &&
                        !data.departmentId
                    ) {
                        return "Department transfer requires targetDepartmentId or departmentId.";
                    }

                    return null;
                },
            ],
        },
    }),
    assetController.transferAsset
);

module.exports = router;
