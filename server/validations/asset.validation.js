const {
    array,
    atLeastOne,
    boolean,
    date,
    number,
    object,
    oneOf,
    optional,
    required,
    string,
    uuid,
} = require("./common.validation");

const assetStatuses = [
    "available",
    "allocated",
    "reserved",
    "under_maintenance",
    "lost",
    "retired",
    "disposed",
];

const assetConditions = ["new", "good", "fair", "poor", "damaged"];
const recordStatuses = ["active", "inactive"];

const idParam = {
    params: {
        fields: {
            id: [required("ID"), uuid("ID")],
        },
    },
};

const listAssets = {
    query: {
        fields: {
            search: [optional(string("Search", { max: 120 }))],
            assetTag: [optional(string("Asset tag", { max: 40 }))],
            serialNumber: [optional(string("Serial number", { max: 120 }))],
            categoryId: [optional(uuid("Category ID"))],
            departmentId: [optional(uuid("Department ID"))],
            locationId: [optional(uuid("Location ID"))],
            status: [optional(oneOf(assetStatuses, "Asset status"))],
            condition: [optional(oneOf(assetConditions, "Condition"))],
            isSharedBookable: [optional(boolean("Shared/bookable flag"))],
        },
    },
};

const createAsset = {
    body: {
        fields: {
            name: [required("Asset name"), string("Asset name", { min: 2, max: 160 })],
            categoryId: [required("Category ID"), uuid("Category ID")],
            serialNumber: [optional(string("Serial number", { max: 120 }))],
            acquisitionDate: [optional(date("Acquisition date"))],
            acquisitionCost: [optional(number("Acquisition cost", { min: 0 }))],
            condition: [optional(oneOf(assetConditions, "Condition"))],
            locationId: [optional(uuid("Location ID"))],
            owningDepartmentId: [optional(uuid("Owning department ID"))],
            isSharedBookable: [optional(boolean("Shared/bookable flag"))],
            qrCode: [optional(string("QR code", { max: 255 }))],
            notes: [optional(string("Notes", { max: 2000 }))],
            metadata: [optional(object("Metadata"))],
            attachmentIds: [optional(array("Attachment IDs"))],
        },
    },
};

const updateAsset = {
    params: idParam.params,
    body: {
        fields: {
            name: [optional(string("Asset name", { min: 2, max: 160 }))],
            categoryId: [optional(uuid("Category ID"))],
            serialNumber: [optional(string("Serial number", { max: 120 }))],
            acquisitionDate: [optional(date("Acquisition date"))],
            acquisitionCost: [optional(number("Acquisition cost", { min: 0 }))],
            condition: [optional(oneOf(assetConditions, "Condition"))],
            status: [optional(oneOf(assetStatuses, "Asset status"))],
            locationId: [optional(uuid("Location ID"))],
            owningDepartmentId: [optional(uuid("Owning department ID"))],
            isSharedBookable: [optional(boolean("Shared/bookable flag"))],
            qrCode: [optional(string("QR code", { max: 255 }))],
            notes: [optional(string("Notes", { max: 2000 }))],
            metadata: [optional(object("Metadata"))],
        },
        rules: [
            atLeastOne([
                "name",
                "categoryId",
                "serialNumber",
                "acquisitionDate",
                "acquisitionCost",
                "condition",
                "status",
                "locationId",
                "owningDepartmentId",
                "isSharedBookable",
                "qrCode",
                "notes",
                "metadata",
            ]),
        ],
    },
};

const createCategory = {
    body: {
        fields: {
            name: [required("Category name"), string("Category name", { min: 2, max: 120 })],
            code: [required("Category code"), string("Category code", { min: 2, max: 40 })],
            description: [optional(string("Description", { max: 1000 }))],
            customFields: [optional(object("Custom fields"))],
            status: [optional(oneOf(recordStatuses, "Status"))],
        },
    },
};

const updateCategory = {
    params: idParam.params,
    body: {
        fields: {
            name: [optional(string("Category name", { min: 2, max: 120 }))],
            code: [optional(string("Category code", { min: 2, max: 40 }))],
            description: [optional(string("Description", { max: 1000 }))],
            customFields: [optional(object("Custom fields"))],
            status: [optional(oneOf(recordStatuses, "Status"))],
        },
        rules: [atLeastOne(["name", "code", "description", "customFields", "status"])],
    },
};

module.exports = {
    assetConditions,
    assetStatuses,
    createAsset,
    createCategory,
    idParam,
    listAssets,
    updateAsset,
    updateCategory,
};
