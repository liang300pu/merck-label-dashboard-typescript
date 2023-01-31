import express from "express";
import { 
    createSample, 
    deleteSample, 
    getTeamsSamples,
    getSample,
    getDeletedSamples,
    updateSample,
    getAuditTrail,
    // updateSample,
} from "../controllers/samples";

/**
 * * Base route: /:team/samples
 */
const router = express.Router({
    // Allows us to acces the team parameter from the controllers below
    mergeParams: true
});

router.get("/", getTeamsSamples);
router.get("/:id", getSample);

router.post("/", createSample);

router.patch("/:id", updateSample)

router.delete("/:id", deleteSample);

// Dillema: Should id be the sample id or the audit id?
// For now it will be sample id.
router.get("/:id/audit", getAuditTrail);

// Clashes with the getSample route
// router.get('/deleted', getDeletedSamples);


export default router;