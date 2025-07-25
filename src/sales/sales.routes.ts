import express from "express";
import {
  getSalesReport,
  downloadSalesReportCSV,
  downloadSalesReportPDF,
} from "./sales.controller";

const router = express.Router();

router.get("/sales/report", getSalesReport);
router.get("/sales/report/csv", downloadSalesReportCSV);
router.get("/sales/report/pdf", downloadSalesReportPDF);

export default router;
