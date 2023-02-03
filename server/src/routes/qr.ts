import express from 'express';
import { createPrinter, createQRCodeKey, createQRCodeLabel, getPrinters, deletePrinter, printQRCodeLabel } from '../controllers/qr'

const router = express.Router();

router.post('/key', createQRCodeKey)
router.post('/label/:team', createQRCodeLabel)
router.post('/print', printQRCodeLabel)
router.get('/printers', getPrinters)
router.post('/printers', createPrinter);
router.delete('/printers', deletePrinter)

export default router;