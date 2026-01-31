from flask import Flask, request, jsonify, make_response
import pandas as pd
from datetime import datetime
from flask_cors import CORS, cross_origin
import json
import numpy as np
import psycopg2
from flask import Flask, session
import logging
import sys
from datetime import datetime, date
sys.stdout.flush()







#app = Flask(__name__)
#CORS(app, supports_credentials=True, origins=[
 #   "http://localhost:5173",
    #"https://upload-file-demo-jyxx.onrender.com",
  #  "https://upload-file-frontend.onrender.com"
#])



app = Flask(__name__)
# This allows your specific Render frontend to talk to this backend
CORS(app, supports_credentials=True, origins=[
    "https://upload-file-frontend.onrender.com",
    "http://localhost:5173"
])


# ---------------------------------------
# SESSION CONFIGURATION
# ---------------------------------------
tenant_id = "tenant_123"
user_id = "user_456"







logger = logging.getLogger(__name__)


# ---------------------------------------
# PostgreSQL CONNECTION TESTING FUNCTIONS
# ---------------------------------------
# ✅ OPTION 2: Updated get_connection() function
def get_connection():
    """Get PostgreSQL connection"""
    try:
        conn = psycopg2.connect(
            host="dpg-d534mqur433s73c3v8ug-a.oregon-postgres.render.com",
            database="file_upload_demo",
            user="client_analytics_db_user",
            password="xa2BzufcOQyjZIV8qezOffg2FgvIinPL",
            port=5432,
            connect_timeout=10,
            # application_name="ShindeeShoes"
        )
        return conn
    except Exception as e:
        logger.error(f"❌ Connection failed: {str(e)}")
        raise


    
# ---------------------------------------
# PostgreSQL CONNECTION FUNCTION
# ---------------------------------------

# if __name__ == "__main__":
    
    # allowed columns in the CSV
REQUIRED_COLUMNS = [
    "Sale ID",	"Location (City)",	"Store Name", "Product","Size","Color",	"Price (INR)",	"Quantity Sold","Date","Sales Rep"

]

REQUIRED_COLUMNS_VALUES = [
    "Sale ID","Location (City)","Store Name","Product",
    "Size","Color","Price (INR)","Quantity Sold","Date","Sales Rep"
]

# allowed date formats
# ALLOWED_DATE_FORMATS = [
#     "%d-%m-%Y", "%m-%d-%Y", "%Y-%m-%d", "%Y-%d-%m",
#     "%d/%m/%Y", "%m/%d/%Y", "%Y/%m/%d"
# ]

ALLOWED_DATE_FORMATS = [
    # "%d/%m/%Y",
    "%m%d%Y"
]


# Allowed File Name For All Uploads
# Allowed_File_Name = ["Mis_Sale_Summary(14_01_2026)","salesdata-slot-15","salesdata-slot-14","salesdata-slot-13-2","salesdata-slot-12","salesdata-slot-11","salesdata-slot-10","salesdata-slot-9","salesdata-slot-8","salesdata-slot-7","salesdata-slot-6","salesdata-slot-5","salesdata-slot-4","salesdata-slot-3",
#                      "salesdata-slot-2","salesdata-slot-1","salesdata - copy", 
#                      "InventoryData", "CustomerData", "salesdata", "Footwear_Model 18Dec2025","Alteration"]

Allowed_File_Name = [ "salesdata", "salesdata-slot-1", "salesdata-slot-2" ]
# ---------------------------------------
#       DATE VALIDATION FUNCTIONS
# ---------------------------------------
# def validate_date(date_value):
#     """
#     Accept dates in ANY common format and convert to PostgreSQL standard (YYYY-MM-DD)
#     """

#     # Check if empty/null
#     if pd.isna(date_value) or str(date_value).strip() == "":
#         return None

#     date_str = str(date_value).strip()

    


#     for fmt in ALLOWED_DATE_FORMATS:
#         try:
#             parsed_date = datetime.strptime(date_str, fmt)
#             # ✅ Always convert to PostgreSQL standard format (YYYY-MM-DD)
#             return parsed_date.strftime("%Y-%m-%d")
#         except ValueError:
#             continue

#     # If no format matched, return None (invalid date)
#     logger.warning(f"❌ Could not parse date: '{date_str}'. Tried multiple formats.")
#     return None
    


def validate_date(date_value):
    """
    Read the date column strictly as STRING.
    Do NOT parse or convert.
    Return the value as-is and print it to console.
    """

    # Handle null / empty values
    if pd.isna(date_value) or str(date_value).strip() == "":
        print("ℹ️ Date value is NULL or empty")
        return None

    # Treat input strictly as STRING
    date_str = str(date_value).strip()

    # Print to console after successful read
    print(f"✅ Read date string Done: {date_str}")

    # Return as-is (STRING)
    return date_str




# ---------------------------------------
# check Cell is empty Our not
# ---------------------------------------
def is_empty(val):
    """Check if a cell is empty"""
    return pd.isna(val) or str(val).strip() == ""




# ---------------------------------------
# ROW VALIDATION FUNCTIONS 
# ---------------------------------------
def validate_row(row):
    errors = []
    for col in REQUIRED_COLUMNS_VALUES:
        if is_empty(row.get(col)):
            errors.append(f"{col} is required")

    return errors




# ---------------------------------------
# Clean NaN and Infinity Values
# ---------------------------------------
def clean_nan_values(obj):
    """
    Recursively replace NaN, Infinity values with None in nested structures
    """
    if isinstance(obj, dict):
        return {k: clean_nan_values(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_nan_values(item) for item in obj]
    elif isinstance(obj, float):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return obj
    else:
        return obj





#------------------------------------------------------
#          Python Dictionary to Store metadata
#------------------------------------------------------

def store_metadata_load_master():
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
                insert into "public".load_master (tenant_id,user_id,filename,status,file_type,file_url,max_date) 
                    values (%s, %s, %s, %s, %s, %s, %s);
            """,(
                metadata["tenant_id"],
                metadata["user_id"],
                metadata["FileName"],
                metadata["Status"],
                metadata["FileType"],
                metadata["Fileurl"],
                metadata["MaxDate"]
            )
            
            )
        conn.commit()
        print("✅ Metadata stored successfully to load_master table")

    except Exception as e:
        conn.rollback()
        print("❌ Procedure failed:", e)
        raise

    finally:
        cur.close()
        conn.close()

    

metadata = {
        "Fileurl": "www.example.com/uploadedfile.csv",
        "tenant_id": 1,
        "user_id": 1
        


    }

#------------------------------------------------------
#                  Insert Sales Data
#------------------------------------------------------

print("✅ insert_sales_data() function STARTED")




def call_insert_sales_procedure_bulk(df, batch_size=1000):
    conn = get_connection()
    cur = conn.cursor()
    total_rows = len(df)
    success_count = 0
    error_rows = []

    start_time = datetime.now()

    try:
        logger.info(f"📊 Starting bulk insert: {total_rows} total rows")

        for batch_num in range(0, total_rows, batch_size):
            batch_end = min(batch_num + batch_size, total_rows)
            print(f"📦 Progress: {batch_num}/{total_rows} rows ({(batch_num/total_rows)*100:.1f}%)")

            batch_df = df.iloc[batch_num:batch_end]

            for idx, (_, row) in enumerate(batch_df.iterrows(), start=batch_num + 1):
                savepoint_name = f"sp_{idx}"

                try:
                    # ✅ Create savepoint
                    cur.execute(f"SAVEPOINT {savepoint_name};")

                    row_dict = row.to_dict()
                    row_dict = clean_nan_values(row_dict)

                    cur.execute("""
                        INSERT INTO "upload_data"."sales_data" (
                            sale_id,
                            location_city,
                            store_name,
                            product,
                            size,
                            color,
                            price_inr,
                            quantity_sold,
                            sale_date,
                            sales_rep
                        )
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                    """, (
                        row_dict["Sale ID"],
                        row_dict["Location (City)"],
                        row_dict["Store Name"],
                        row_dict["Product"],
                        row_dict["Size"],
                        row_dict["Color"],
                        row_dict["Price (INR)"],
                        row_dict["Quantity Sold"],
                        row_dict["Date"],
                        row_dict["Sales Rep"]
                    ))

                    success_count += 1
                    cur.execute(f"RELEASE SAVEPOINT {savepoint_name};")
                    cur.execute("SELECT current_database();")
                    # print("✅ Connected DB:", cur.fetchone())

                except Exception as e:
                    try:
                        cur.execute(f"ROLLBACK TO {savepoint_name};")
                    except:
                        pass
                    
                    error_rows.append({"row": idx, "error": str(e)})
                    logger.error(f"❌ Row {idx} failed: {str(e)}")

            # ✅ Commit batch
            try:
                conn.commit()
                logger.info(f"💾 Batch starting at {batch_num} committed.")
            except Exception as e:
                conn.rollback()
                logger.error(f"❌ Batch commit failed: {str(e)}")
                raise

        elapsed_time = datetime.now() - start_time
        logger.info(f"✅ COMPLETED! {success_count}/{total_rows} rows inserted in {elapsed_time}")

    except Exception as e:
        conn.rollback()
        logger.error(f"❌ CRITICAL ERROR: {str(e)}")
        raise

    finally:
        cur.close()
        conn.close()

    return {
        "total": total_rows,
        "success": success_count,
        "failed": len(error_rows),
        "error_rows": error_rows
    }
#------------------------------------------------------
#      TRUNCATE FUNCTION Before Load Truncate Table
#------------------------------------------------------

def truncate_sales_table():
    """✅ FIXED: Truncate without extra quotes"""
    conn = get_connection()
    cur = conn.cursor()
    try:
        # ✅ CORRECT: No quotes around table name
        cur.execute('TRUNCATE TABLE "Stagging_Tables".sales_data RESTART IDENTITY CASCADE;')
        conn.commit()
        logger.info("🧹 sales_data table truncated successfully")
    except Exception as e:
        conn.rollback()
        logger.warning(f"⚠️ Truncate failed (may have FK constraints): {str(e)}")
        # Don't raise - just warn and continue
    finally:
        cur.close()
        conn.close()




#------------------------------------------------------
#          MASTER LOAD FUNCTION
#------------------------------------------------------

def truncate_and_load_sales(df):
    """Master function - truncate then load"""
    try:
        truncate_sales_table()
    except:
        logger.warning("Skipping truncate, proceeding with insert...")
    
    logger.info("Loading data into sales_data table...")
    result = call_insert_sales_procedure_bulk(df, batch_size=1000)
    return result


#------------------------------------------------------------------
#      Converting all the Data As Per the Backend table structure               
#------------------------------------------------------------------
# def Rearange_Columns_DataTypes(df):
#     # 1. Clean column names
#     print("Cleaning column names...")
#     df.columns = df.columns.str.strip().str.replace('\ufeff', '')

#     # 2. FILL EMPTY CELLS WITH 0 (Numeric) or "" (Strings)
#     # Define which columns should be 0 if empty
#     numeric_cols = [
#          "TotalQty", "NetAmount", "DisplayStockDays",
#         "MRP", "SaleRate", "BillDiscount", "TotalDiscountAmount", 
#         "TaxableAmount", "TaxRate", "TaxAmount", "BillAmount", "MobileNo"
#     ]
    
#     for col in numeric_cols:
#         if col in df.columns:
#             # Convert to numeric, turn errors to NaN, then fill NaN with 0
#             df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

#     # 3. Handle Strings (Fill empty strings instead of 0)
#     string_cols = [
#         "BillNo", "Brand", "CategoryDesc", "ProductDesc", "ColorCode", "Size",
#         "SalesMan1Name", "Supplier", "LocationName", "CreatedUser", "CategoryCode",
#         "SubCategoryCode", "SubCategoryDesc", "ProductCode", "ColorDesc", 
#         "SizeRange", "HSNCode", "HSNDesc", "TaxDesc", "Customer", "GSTIN", 
#         "BillComment", "Counter", "ModifiedUser","SKU"
#     ]
#     for col in string_cols:
#         if col in df.columns:
#             df[col] = df[col].astype(str).replace(['nan', 'None', 'NaN'], '')
#             # If you want a specific placeholder like '0' for missing strings:
#             # df[col] = df[col].replace('', '0')

#------------------------------------------------------
#                    API CODE
#------------------------------------------------------


@app.route("/upload", methods=["POST", "OPTIONS"])
@cross_origin(origin='upload-file-frontend.onrender.com', headers=['Content-Type', 'Authorization'])

def upload_file():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
        
    print("1")
    if "file" not in request.files:
        return jsonify({"status": False, "message": "No file uploaded!"}), 400

    file = request.files["file"]
    uploaded_File_Name = file.filename.rsplit(".", 1)[0].lower()
    print("2")
    if not file.filename.endswith(".csv"):
        return jsonify({"status": False, "message": "Invalid file type! Upload CSV only"}), 400
    print("3")
    if uploaded_File_Name not in Allowed_File_Name:
        return jsonify({"status": False, "message": "Invalid file name!"}), 400
    print("4")
    try:
        
        file.seek(0)
        # 1. READ
        
        print("Reading CSV file...")
        print("5")
        # df = pd.read_csv(file, dtype={"BillNo": str}, low_memory=False)
        df = pd.read_csv(
            file,
            dtype={
                # "BillNo": str,
                # "SKU": str,
                # "BillDate": str,
                # "LastPurDate": str
            },
            # keep_default_na=False,   # 🚨 THIS IS CRITICAL
            # na_filter=False,         # 🚨 ALSO IMPORTANT
            # low_memory=False
        )
        print("CSV columns:", df.columns.tolist())
        print("6")
        # print("===== RAW CSV DATE CHECK =====")
        # for i in range(10):
        #     print(
        #         i,
        #         repr(df.loc[i, "BillDate"]),
        #         type(df.loc[i, "BillDate"])
        #     )
        # print("==============================")

        print("CSV file read into DataFrame.")
        # ✅ VERIFY
        # print(f"SKU values: {df['SKU'].head()}")
        # print(f"Data type of SKU: {df['SKU'].dtype}")

        # ✅ CLEAN UP
        # df["SKU"] = df["SKU"].str.strip()
        print("Rows in uploaded file:", df)
        print("7")
        # 2. CLEAN HEADERS
        df.columns = df.columns.str.strip().str.replace('\ufeff', '')

        # 3. CONVERT NUMBERS/STRINGS (Date conversion removed from here)

        # print(df["BillDate"].head(10).tolist())
        # print(df["BillDate"].apply(type).head(10).tolist())


        # print("Columns rearranged and data types converted.")
        # Rearange_Columns_DataTypes(df) 
        # print("Columns rearranged and data types converted.")
        # print(f"Data type of SKU: {df['SKU'].dtype}")
        # print(df["SKU"])
        # 4. VALIDATE DATES (Your custom logic is now the primary tool)
        # df["BillDate"] = df["BillDate"].apply(validate_date)
        # df["LastPurDate"] = df["LastPurDate"].apply(validate_date)

        # bad_rows = df[
        # (df["BillDate"].isna()) |
        # (df["BillDate"].astype(str).str.strip() == "")
        # ]

        # print("❌ Rows with empty BillDate:")
        # print(bad_rows[["BillDate"]].head(20))
        # print("Total bad rows:", len(bad_rows))
        # 5. CLEAN NULLS
        df = df.replace({np.nan: None, np.inf: None, -np.inf: None})
        df = df.dropna(how="all")
        
        # 6. ROW IDs
        df["OriginalRow"] = df.index + 2
        df = df.reset_index(drop=True)
        df["RowID"] = df["OriginalRow"]

        # 7. DATE CHECK
        invalid_dates = df[df["Date"].isna()]
        if not invalid_dates.empty:
            return jsonify({
                "status": False, 
                "message": "Invalid Date found", 
                "rows": invalid_dates["RowID"].tolist()
            }), 400

        # 8. COLUMN CHECK
        missingColumns = [c for c in REQUIRED_COLUMNS if c not in df.columns]
        if missingColumns:
            return jsonify({"status": False, "message": "Column Mismatch", "missingColumns": missingColumns}), 400

        # 9. ROW VALIDATION
        errorRows = []
        for i, row in df.iterrows():
            errs = validate_row(row)
            if errs:
                r = row.to_dict()
                r["error"] = ", ".join(errs)
                errorRows.append({"rowNumber": row["RowID"], "data": r})

        if errorRows:
            return jsonify({"status": False, "message": "Row errors exist", "errorRows": errorRows}), 400

        print("8")
        # 10. DATABASE LOAD
        truncate_and_load_sales(df)
        
        return jsonify({"status": True, "message": "File uploaded and processed successfully!"}), 200

    def _build_cors_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "https://upload-file-frontend.onrender.com")
    response.headers.add('Access-Control-Allow-Headers', "*")
    response.headers.add('Access-Control-Allow-Methods', "*")
    return response
    
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({"status": False, "message": f"Server Error: {str(e)}"}), 500








# New API Code

# @app.route("/upload", methods=["POST"])
# @cross_origin(origins="http://localhost:5173")
# def upload_file():

#     print("▶ Upload API called")

#     if "file" not in request.files:
#         return jsonify({"status": False, "message": "No file uploaded!"}), 400

#     file = request.files["file"]
#     uploaded_File_Name = file.filename.rsplit(".", 1)[0].lower()

#     if not file.filename.endswith(".csv"):
#         return jsonify({"status": False, "message": "Invalid file type! Upload CSV only"}), 400

#     if uploaded_File_Name not in Allowed_File_Name:
#         return jsonify({"status": False, "message": "Invalid file name!"}), 400

#     try:
#         file.seek(0)

#         print("▶ Reading CSV file...")
#         df = pd.read_csv(
#             file,
#             dtype={
#                 "BillNo": str,
#                 "SKU": str,
#                 "BillDate": str,
#                 "LastPurDate": str
#             },
#             keep_default_na=False,
#             na_filter=False
#         )

#         print("✅ CSV read successful")

#         # 🔥 VERY IMPORTANT DEBUG
#         print("📌 CSV COLUMNS:", df.columns.tolist())

#         # 🔒 COLUMN GUARDS (THIS WAS MISSING BEFORE)
#         required_cols = ["BillDate", "LastPurDate"]
#         missing = [c for c in required_cols if c not in df.columns]

#         if missing:
#             print("❌ Missing required columns:", missing)
#             return jsonify({
#                 "status": False,
#                 "message": "Missing required columns",
#                 "missingColumns": missing
#             }), 400

#         # 🔎 SAFE DEBUG PRINTS (NOW THEY WILL RUN)
#         print("📅 BillDate sample values:", df["BillDate"].head(10).tolist())
#         print("📅 BillDate types:", df["BillDate"].apply(type).head(10).tolist())

#         print("📅 LastPurDate sample values:", df["LastPurDate"].head(10).tolist())
#         print("📅 LastPurDate types:", df["LastPurDate"].apply(type).head(10).tolist())

#         # 🧹 Clean headers
#         df.columns = df.columns.str.strip().str.replace('\ufeff', '')

#         # 🔧 Rearrange / clean other columns
#         Rearange_Columns_DataTypes(df)

#         # ✅ DATE VALIDATION (THIS WILL NOW EXECUTE)
#         print("▶ Applying validate_date() on BillDate...")
#         # df["BillDate"] = df["BillDate"].apply(validate_date)

#         print("▶ Applying validate_date() on LastPurDate...")
#         # df["LastPurDate"] = df["LastPurDate"].apply(validate_date)

#         # 🧼 Clean NaN / inf
#         df = df.replace({np.nan: None, np.inf: None, -np.inf: None})
#         df = df.dropna(how="all")

#         # 🆔 Row tracking
#         df["OriginalRow"] = df.index + 2
#         df = df.reset_index(drop=True)
#         df["RowID"] = df["OriginalRow"]

#         # 🚨 BillDate check
#         invalid_dates = df[df["BillDate"].isna()]
#         if not invalid_dates.empty:
#             print("❌ Invalid BillDate rows:", invalid_dates["RowID"].tolist())
#             return jsonify({
#                 "status": False,
#                 "message": "Invalid BillDate found",
#                 "rows": invalid_dates["RowID"].tolist()
#             }), 400

#         # 📦 Load to DB
#         truncate_and_load_sales(df)

#         print("✅ Upload completed successfully")
#         return jsonify({"status": True, "message": "File uploaded and processed successfully!"}), 200

#     except Exception as e:
#         print("🔥 EXCEPTION OCCURRED:", str(e))
#         logger.exception("Upload failed")
#         return jsonify({"status": False, "message": f"Server Error: {str(e)}"}), 500



@app.route("/test")
def test():
    return jsonify({"message": "Backend Running Successfully"})


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5500))
    app.run(host='0.0.0.0', port=port)



