const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Papa = require("papaparse");
const fs = require("fs");

const app = express();
app.use(cors({ origin: "http://localhost:5173" })); // Allow Vite frontend
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Upload config
const upload = multer({ dest: "uploads/" });

// Expected columns
const requiredColumns = [
  "BillNo",
  "BillDate",
  "Brand",
  "Gender",
  "Category",
  "Product",
  "ColorCode",
  "Size",
  "SKU",
  "TotalQty",
  "MRP",
  "SellPrice",
  "NetAmount",
  "MobileNo",
  "SalesMan1Name",
  "Points",
  "Supplier",
  "BillTime",
  "LocationName"
];


// Rules for each row of CSV
function validateRow(row) {
  const errors = [];

  // Example rules — modify as per business logic
  if (!row.Gender || row.Gender.trim() === "") {
    errors.push("Gender is required");
  }
  if (!row.MobileNo || row.MobileNo.trim() === "") {
    errors.push("MobileNo is required");
  }
  if (row.NetAmount && row.NetAmount.includes(".")) {
    errors.push("NetAmount must not contain decimal values");
  }
  if (!row.BillNo || isNaN(row.BillNo)) {
    errors.push("BillNo must be a number");
  }

  return errors;
}

// API Route — Upload & Validate CSV
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.json({ status: false, message: "No file uploaded" });
  }

  const csvData = fs.readFileSync(req.file.path, "utf8");

  Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
    complete: (result) => {
      const parsedData = result.data;
      const csvColumns = result.meta.fields;

      // 1️⃣ Validate Columns
      const missingColumns = requiredColumns.filter(
        (col) => !csvColumns.includes(col)
      );

      if (missingColumns.length > 0) {
        return res.json({
          status: false,
          message: "Columns mismatch",
          missingColumns
        });
      }

      // 2️⃣ Validate Rows
      const errorRows = [];

      parsedData.forEach((row, index) => {
        const errors = validateRow(row);

        if (errors.length > 0) {
          row.error = errors.join(", "); // ✨ Add error column

          errorRows.push({
            rowNumber: index + 2, // Excel row number (+ header line)
            data: row
          });
        }
      });

      if (errorRows.length > 0) {
        return res.json({
          status: false,
          message: "Row validation errors found",
          errorRows
        });
      }

      return res.json({
        status: true,
        message: "CSV valid! No errors found"
      });
    },
    error: (err) => {
      return res.status(500).json({
        status: false,
        message: "CSV parsing failed",
        error: err.message
      });
    }
  });
});

// Start Server
app.listen(5500, () => {
  console.log("🚀 Backend is running on http://localhost:5500");
});
