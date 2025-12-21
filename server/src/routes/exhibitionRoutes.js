const express = require("express");
const router = express.Router();

const exhibitionController = require("../controllers/exhibitionController");
const requireAuthentication = require("../middlewares/requireAuthentication");
const enforceRoleAccess = require("../middlewares/enforceRoleAccess");
const upload = require("../middlewares/uploadMiddleware");

const blockNonVisitors = require("../middlewares/blockNonVisitors");
const validateExhibitDates = require("../middlewares/validateDates");
const optionalAuthentication = require("../middlewares/optionalAuthentication");

// Creates a new exhibition listing

router.post(
    "/",
    requireAuthentication,
    enforceRoleAccess(["exhibitor"]),
    upload.array('mediaFiles', 10), // Allow up to 10 files
    validateExhibitDates,
    exhibitionController.createExhibitListing
);

// Retrieves exhibitions created by the currently authenticated exhibitor

router.get(
    "/my",
    requireAuthentication,
    enforceRoleAccess(["exhibitor"]),
    exhibitionController.fetchMyExhibits
);

// Updates details of an existing exhibition

router.put(
    "/:id",
    requireAuthentication,
    enforceRoleAccess(["exhibitor"]),
    upload.array('mediaFiles', 10), // Allow updates with files
    validateExhibitDates,
    exhibitionController.updateExhibitDetails
);

// Uploads media files to a specific exhibition

router.put(
    "/:id/media",
    requireAuthentication,
    enforceRoleAccess(["exhibitor"]),
    upload.array('mediaFiles', 10), // Allow up to 10 files
    exhibitionController.uploadExhibitMedia
);

// Removes a specific media item from an exhibition

router.delete(
    "/:id/media/:mediaId",
    requireAuthentication,
    enforceRoleAccess(["exhibitor"]),
    exhibitionController.removeExhibitMedia
);

// Permanently deletes an exhibition listing

router.delete(
    "/:id",
    requireAuthentication,
    enforceRoleAccess(["exhibitor"]),
    exhibitionController.deleteExhibitListing
);



// Lists all public exhibitions available to visitors

router.get("/", blockNonVisitors, exhibitionController.fetchPublicExhibits);

// grants access to the full exhibition view, enforcing payment or access rules

router.get(
    "/:id/view",
    requireAuthentication,
    requireAuthentication.canAccessExhibit,
    exhibitionController.accessPaywalledExhibit
);


// Verifies if the current user has access to a specific exhibition

router.get("/:id/access", optionalAuthentication, exhibitionController.checkAccess);

// Retrieves public details of an exhibition, with some data conditionally hidden

router.get("/:id", exhibitionController.viewExhibitDetails);

module.exports = router;
