import { Request, Response } from "express";
import { getSalesData } from "./sales.service";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import { format } from "date-fns";

// GET /api/report (JSON for frontend)
export const getSalesReport = async (req: Request, res: Response) => {
  try {
    const report = await getSalesData();
    res.json(report);
  } catch (error) {
    console.error("Sales Report Error:", error);
    res.status(500).json({ error: "Failed to generate sales report" });
  }
};

// GET /api/report/csv (CSV download)
export const downloadSalesReportCSV = async (req: Request, res: Response) => {
  try {
    const report = await getSalesData();
    const flatData = [
      {
        totalRevenue: report.totalRevenue,
        totalBookings: report.totalBookings,
        topEvents: report.topEvents.map(e => `${e.title} (${e.ticketsSold})`).join("; ")
      }
    ];

    const parser = new Parser();
    const csv = parser.parse(flatData);

    res.header("Content-Type", "text/csv");
    res.attachment("sales_report.csv");
    return res.send(csv);
  } catch (error) {
    console.error("CSV Report Error:", error);
    res.status(500).json({ error: "Failed to generate CSV report" });
  }
};

// GET /api/report/pdf (PDF download)
export const downloadSalesReportPDF = async (req: Request, res: Response) => {
  try {
    const report = await getSalesData();

    const doc = new PDFDocument();
    const filename = `sales_report_${format(new Date(), "yyyy-MM-dd")}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    doc.pipe(res);

    doc.fontSize(20).text("📊 Sales Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Total Revenue: KES ${report.totalRevenue}`);
    doc.text(`Total Bookings: ${report.totalBookings}`);
    doc.moveDown();

    doc.fontSize(16).text("Top Events:");
    report.topEvents.forEach((event, index) => {
      doc.fontSize(12).text(`${index + 1}. ${event.title} - ${event.ticketsSold} tickets sold`);
    });

    doc.end();
  } catch (error) {
    console.error("PDF Report Error:", error);
    res.status(500).json({ error: "Failed to generate PDF report" });
  }
};
