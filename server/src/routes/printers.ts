import express from "express";
import { 
    getPrinters,
    createPrinter,
    deletePrinter,
    updatePrinter,
} from "../controllers/printers";

const router = express.Router({
    // Allows us to acces the team parameter from the controllers below
    mergeParams: true
});

router.get('/', getPrinters);

router.post('/', createPrinter);

router.delete('/:ip', deletePrinter);

router.patch('/:ip', updatePrinter);

export default router;