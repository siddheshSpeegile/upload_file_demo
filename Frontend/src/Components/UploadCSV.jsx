// import React, { useState, useRef } from "react";
// import axios from "axios";

// function UploadCSV() {
//   const [fileName, setFileName] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [errorRows, setErrorRows] = useState([]);
//   const [columnErrors, setColumnErrors] = useState([]);
//   const [isError, setIsError] = useState(true);
//   // const [ServerResponse, setServerResponse] = useState(null);

//   const fileInputRef = useRef(null);

//   const handleFileSelect = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       setFileName(file.name);
//       setMessage("");
//     }
//   };

//   const handleUpload = async () => {
//     const fileInput = document.getElementById("csvFile");
//     if (!fileInput.files.length) {
//       alert("Please select a file first!");
//       return;
//     }

//     const file = fileInput.files[0];
//     const formData = new FormData();
//     formData.append("file", file);

//     setLoading(true);
//     setMessage("");
//     setErrorRows([]);
//     setColumnErrors([]);
//     setIsError(false);     // reset first

//     try {
//       // alert("File Selected");
//       const res = await axios.post("http://localhost:5500/upload", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//         validateStatus: () => true,
//           timeout: 600000  // 10 minutes
          

//       });

//       setLoading(false);

//       console.log("Full Axios Response:", res);
//       console.log("Response Data:", res.data);
//       console.log("Response Data Type:", typeof res.data);

//       let result = res.data;

//       // Check The response structure
//       if (typeof result === 'string') {
//       try {
//         result = JSON.parse(result);
//       } catch (parseError) {
//         console.error("JSON Parse Error:", parseError);
//         setIsError(true);
//         setMessage("❌ Invalid response from server!");
//         return;
//       }
//     }

//      console.log("✅ Parsed Result:", result);

//       console.log("Result Object:", result);
//       console.log("Status:", result.status);
//       console.log("Has errorRows?", result.errorRows);
//       console.log("ErrorRows length:", result.errorRows?.length);
//       console.log("Has missingColumns?", result.missingColumns);

//       // setServerResponse(result.errorRows);
//       console.log("SERVER RESPONSE:", result); // DEBUG

//       // console.log("Backend Response:", JSON.stringify(result, null, 2));
//       // console.log("Has missingColumns?", result.missingColumns);
//       // console.log("Has errorRows?", result.errorRows);
//       // console.log("Status:", result.status);

//       // 1️⃣ Check for Column Errors
//       if (!result.status && result.missingColumns) {
//         setColumnErrors(result.missingColumns);
//         setIsError(true);
//         setMessage("⛔ Column mismatch found!");
//         return;
//       }

//       // // Set The Row Errors

//       // // 2️⃣ Check for Row Errors
//       // if (!result.status && result.errorRows) {
//       //   // setErrorRows([])
//       //   setErrorRows(result.errorRows);
//       //   console.log("Row Error Status:- "+ result.status);
//       //   setIsError(true);
//       //   setMessage("⚠️ Some row errors found!");
//       //   return;
//       // }

//       // // 3️⃣ If status === true → Valid CSV
//       // if (result.status === true) {
//       //   // console.log("SERVER RESPONSE:", result.status);
//       //   setErrorRows([]);
//       //   setIsError(false);
//       //   setMessage("🎉 CSV Valid — No Errors Found!");
//       // }

//       // check for file name error first
//       if (!result.status && result.UploadedFileName) {
//   setIsError(true);
//   setMessage(`❌ ${result.message}. You uploaded: ${result.UploadedFileName}.csv`);
//   return;
// }




//       // 1️⃣ Check for Column Errors
//       if (
//         !result.status &&
//         result.missingColumns &&
//         result.missingColumns.length > 0
//       ) {
//         setColumnErrors(result.missingColumns);
//         setIsError(true);
//         setMessage("⛔ Column mismatch found!");
//         return;
//       }

//       // 2️⃣ Check for Row Errors
//       if (!result.status && result.errorRows && result.errorRows.length > 0) {
//         setErrorRows(result.errorRows);
//         console.log("Row errors found:", result.errorRows.length);
//         setIsError(true);
//         setMessage(" Found row errors!");
//         return;
//       }

//       // 3️⃣ If status === true → Valid CSV
//       if (result.status === true) {
//         setErrorRows([]);
//         setColumnErrors([]);
//         setIsError(false);
//         setMessage("🎉 CSV Valid — No Errors Found!");
//         return;
//       }
          
//       // 4️⃣ Fallback for unexpected response
//       setIsError(true);
//       setMessage("❌ Unexpected response format!");
//       console.error("Unexpected result structure:", result);

//     } catch (err) {
//       console.error("Upload error:", err);
//       setLoading(false);
//       setIsError(true);
//       setMessage("❌ Upload Failed! Check Server.");
//       console.log("❌ Axios Error:", err);
//       console.log("❌ Response:", err.response);
//       console.log("❌ Request:", err.request);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center p-6  rounded-md shadow-xl/10 bg-gray-100 min-h-screen">
//       <div className="my-10 rounded-md shadow-xl/10 p-6 w-150 bg-white flex flex-col items-center">
//         <h1 className="text-center text-3xl font-extrabold my-2">
//           File Validator
//         </h1>
//         {/* <h2 className="text-center">Upload CSV</h2> */}

//         <input
//           type="file"
//           id="csvFile"
//           accept=".csv"
//           ref={fileInputRef}
//           onChange={handleFileSelect}
//           className="hidden"
//         />

//         <button
//           type="button"
//           onClick={() => fileInputRef.current?.click()}
//           // className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold m-5 cursor-pointer hover:bg-blue-700 transition-colors min-w-48 max-w-80 text-center"
//           className={`px-4 py-2 rounded-lg text-white font-semibold  hover:bg-blue-700 transition-colors min-w-48 max-w-80 text-center ${
//             fileName
//               ? "bg-gray-400 cursor-not-allowed"
//               : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
//           }`}
//         >
//           Upload CSV
//         </button>

//         <div className="my-4">
//           {fileName && (
//             <p
//               style={{ marginTop: "5px" }}
//               className="mt-4 text-center border border-none outline-yellow-200 outline-dashed p-4 rounded-lg bg-gray-50 min-w-24 max-w-80"
//             >
//               📄 Selected: {fileName}
//             </p>
//           )}
//         </div>
//         {/* <button 
//         onClick={handleUpload} 
//         style={{ marginTop: "10px", padding: "6px 12px", cursor: "pointer" }}
//       >
//         Send File for Validation
//       </button> */}

//         <button
//           onClick={handleUpload}
//           className="
//     mt-3 inline-flex items-center gap-2
//     rounded-full px-5 py-2.5
//     text-sm font-semibold tracking-wide
//     text-white
//     bg-emerald-600 hover:bg-emerald-700
//     focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2
//     shadow-md hover:shadow-lg
//     transition
//   "
//         >
//           <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs">
//             ✓
//           </span>
//           <span>Send File for Validation</span>
//         </button>

//         {/* {loading && (
//         <p style={{ color: "blue", marginTop: "10px" }}>
//           🔄 Validating CSV... Please wait
//         </p>
//       )} */}

//         {loading && (
//           <div className="mt-3 w-full max-w-sm">
//             <p className="text-sm text-slate-600 mb-1">
//               🔄 Validating CSV... Please wait
//             </p>

//             {/* Track */}
//             <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
//               {/* Animated bar */}
//               <div className="h-2 w-1/3 bg-emerald-500 animate-[progress_1.2s_ease-in-out_infinite]" />
//             </div>
//           </div>
//         )}

//         {message && (
//           <div
//             className={`
//       mt-3 flex items-start gap-2 rounded-lg border px-3 py-2 text-sm
//       ${
//         isError
//           ? "border-red-200 bg-red-50 text-red-800"
//           : "border-emerald-200 bg-emerald-50 text-emerald-800"
//       }
//     `}
//           >
//             <span className="mt-0.5 text-lg">{isError ? "⚠️" : "✅"}</span>
//             <p className="font-medium">{message}</p>
//           </div>
//         )}

//         {/* Column Errors */}
//         {columnErrors.length > 0 && (
//           <div style={{ marginTop: "20px", color: "red" }}>
//             <h3>Missing Columns:</h3>
//             <ul>
//               {columnErrors.map((col, i) => (
//                 <li key={i}>{col}</li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>

//       {/* Row Error Table */}
//       {/* {errorRows.length > 0 && (
//         <table border="1" cellPadding="">
//           <div className="overflow-scroll w-full h-120 sm:w-170 lg:w-320 p-5 border rounded-lg bg-white">
//             <table className="w-full  border-spacing-4 border border-gray-200">
//               <thead>
//                 <tr className="bg-gray-200">
//                   <th className="px-6 py-4 text-left font-bold text-gray-800 border border-gray-300 rounded-lg bg-gray-100">
//                     Error
//                   </th>

//                   {Object.keys(errorRows[0].data)
//                     .filter((col) => col.toLowerCase() !== "error")
//                     .map((col) => (
//                       <th
//                         key={col}
//                         className="px-6 py-4 text-left font-bold text-gray-800 border border-gray-300 rounded-lg bg-gray-100"
//                       >
//                         {col}
//                       </th>
//                     ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {errorRows.map((row, index) => (
//                   <tr
//                     key={index}
//                     className="hover:bg-gray-50 transition-colors"
//                   >
//                     <td className="px-6 py-4 text-red-600 font-bold border border-gray-300 rounded-lg bg-red-50">
//                       {row.data.error}
//                     </td>

//                     {Object.keys(row.data)
//                       .filter((col) => col.toLowerCase() !== "error")
//                       .map((col) => (
//                         <td
//                           key={col}
//                           className="px-6 py-4 text-gray-900 border border-gray-300 rounded-lg bg-white"
//                         >
//                           {row.data[col]}
//                         </td>
//                       ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </table>
//       )} */}

//       {errorRows.length > 0 && (
//         <div className="w-full max-w-7xl mt-8 p-6 bg-white rounded-lg shadow-lg">
//           <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
//             <span>⚠️</span>
//             <span>Validation Errors Found ({errorRows.length} rows)</span>
//           </h2>

//           <div className="overflow-x-auto overflow-y-auto max-h-96 border border-gray-300 rounded-lg">
//             <table className="w-full border-collapse">
//               <thead className="sticky top-0 bg-gray-100 z-10">
//                 <tr>
//                   {/* Error column first */}
//                   <th className="px-4 py-3 text-left font-bold text-gray-800 border border-gray-300 bg-red-100 min-w-48">
//                     Error
//                   </th>
//                   <th className="font-extrabold px-4 py-3 text-left text-gray-800 border border-gray-300 bg-gray-100 min-w-24">
//                     Row ID
//                   </th>

//                   {/* All other columns */}
//                   {errorRows.length > 0 &&
//                     Object.keys(errorRows[0].data)
//                       .filter((col) => col.toLowerCase() !== "error")
//                       .map((col) => (
//                         <th
//                           key={col}
//                           className="px-4 py-3 text-left font-bold text-gray-800 border border-gray-300 bg-gray-100 min-w-32"
//                         >
//                           {col}
//                         </th>
//                       ))}
//                 </tr>
//               </thead>

//               <tbody>
//                 {errorRows.map((row, index) => (
//                   <tr
//                     key={index}
//                     className="hover:bg-gray-50 transition-colors"
//                   >
//                     {/* Error cell first */}
//                     <td className="px-4 py-3 text-red-700 font-semibold border border-gray-300 bg-red-50">
//                       {row.data.error}
//                     </td>
//                     <td className="px-4 py-3 text-gray-700 border border-gray-300 bg-white">
//                       {row.RowID}
//                     </td>

//                     {/* All other data cells */}
//                     {Object.keys(row.data)
//                       .filter((col) => col.toLowerCase() !== "error")
//                       .map((col) => (
//                         <td
//                           key={col}
//                           className="px-4 py-3 text-gray-700 border border-gray-300 bg-white"
//                         >
//                           {row.data[col] !== null && row.data[col] !== undefined
//                             ? String(row.data[col])
//                             : "-"}
//                         </td>
//                       ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div className="mt-4 text-sm text-gray-600">
//             <p>💡 Tip: Fix the errors above and re-upload the CSV file.</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default UploadCSV;



import React, { useState, useRef } from "react";
import axios from "axios";

function UploadCSV() {
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorRows, setErrorRows] = useState([]);
  const [columnErrors, setColumnErrors] = useState([]);
  const [isError, setIsError] = useState(true);

  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      setMessage("");
      setErrorRows([]);
      setColumnErrors([]);
    }
  };

  const handleUpload = async () => {
    const fileInput = document.getElementById("csvFile");
    if (!fileInput.files.length) {
      alert("Please select a file first!");
      return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setMessage("");
    setErrorRows([]);
    setColumnErrors([]);
    setIsError(false);

    try {
      const res = await axios.post("http://localhost:5500/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        validateStatus: () => true,
        timeout: 600000, // 10 minutes
      });

      setLoading(false);

      console.log("Full Axios Response:", res);
      console.log("Response Data:", res.data);

      let result = res.data;

      // Parse response if it's a string
      if (typeof result === "string") {
        try {
          result = JSON.parse(result);
        } catch (parseError) {
          console.error("JSON Parse Error:", parseError);
          setIsError(true);
          setMessage("❌ Invalid response from server!");
          return;
        }
      }

      console.log("✅ Parsed Result:", result);

      // 1️⃣ Check for file name error first
      if (!result.status && result.UploadedFileName) {
        setIsError(true);
        setMessage(
          `❌ ${result.message}. You uploaded: ${result.UploadedFileName}.csv`
        );
        return;
      }

      // 2️⃣ Check for Column Errors
      if (
        !result.status &&
        result.missingColumns &&
        result.missingColumns.length > 0
      ) {
        setColumnErrors(result.missingColumns);
        setIsError(true);
        setMessage("⛔ Column mismatch found!");
        return;
      }

      // 3️⃣ Check for Row Errors
      if (!result.status && result.errorRows && result.errorRows.length > 0) {
        setErrorRows(result.errorRows);
        console.log("Row errors found:", result.errorRows.length);
        setIsError(true);
        setMessage("⚠️ Found row errors!");
        return;
      }

      // 4️⃣ If status === true → Valid CSV
      if (result.status === true) {
        setErrorRows([]);
        setColumnErrors([]);
        setIsError(false);
        setMessage("🎉 CSV Valid — No Errors Found!");
        return;
      }

      // 5️⃣ Fallback for unexpected response
      setIsError(true);
      setMessage("❌ Unexpected response format!");
      console.error("Unexpected result structure:", result);
    } catch (err) {
      console.error("Upload error:", err);
      setLoading(false);
      setIsError(true);
      setMessage("❌ Upload Failed! Check Server.");
      console.log("❌ Axios Error:", err);
      console.log("❌ Response:", err.response);
      console.log("❌ Request:", err.request);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 rounded-md shadow-xl/10 bg-gray-100 min-h-screen">
      <div className="my-10 rounded-md shadow-xl/10 p-6 w-150 bg-white flex flex-col items-center">
        <h1 className="text-center text-3xl font-extrabold my-2">
          File Validator
        </h1>

        <input
          type="file"
          id="csvFile"
          accept=".csv"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={fileName !== ""}
          className={`px-4 py-2 rounded-lg text-white font-semibold transition-colors min-w-48 max-w-80 text-center ${
            fileName
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
          }`}
        >
          Upload CSV
        </button>

        <div className="my-4">
          {fileName && (
            <p className="mt-4 text-center border border-none outline-yellow-200 outline-dashed p-4 rounded-lg bg-gray-50 min-w-24 max-w-80">
              📄 Selected: {fileName}
            </p>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={!fileName || loading}
          className={`
            mt-3 inline-flex items-center gap-2
            rounded-full px-5 py-2.5
            text-sm font-semibold tracking-wide
            text-white
            focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2
            shadow-md hover:shadow-lg
            transition
            ${
              !fileName || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
            }
          `}
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs">
            ✓
          </span>
          <span>Send File for Validation</span>
        </button>

        {loading && (
          <div className="mt-3 w-full max-w-sm">
            <p className="text-sm text-slate-600 mb-1">
              🔄 Validating CSV... Please wait
            </p>

            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-2 w-1/3 bg-emerald-500 animate-[progress_1.2s_ease-in-out_infinite]" />
            </div>
          </div>
        )}

        {message && (
          <div
            className={`
              mt-3 flex items-start gap-2 rounded-lg border px-3 py-2 text-sm
              ${
                isError
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }
            `}
          >
            <span className="mt-0.5 text-lg">{isError ? "⚠️" : "✅"}</span>
            <p className="font-medium">{message}</p>
          </div>
        )}

        {/* Column Errors */}
        {columnErrors.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-bold mb-2">Missing Columns:</h3>
            <ul className="list-disc list-inside text-red-700">
              {columnErrors.map((col, i) => (
                <li key={i}>{col}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Row Error Table */}
      {errorRows.length > 0 && (
        <div className="w-full max-w-7xl mt-8 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
            <span>⚠️</span>
            <span>Validation Errors Found ({errorRows.length} rows)</span>
          </h2>

          <div className="overflow-x-auto overflow-y-auto max-h-96 border border-gray-300 rounded-lg">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-gray-100 z-10">
                <tr>
                  {/* Error column first */}
                  <th className="px-4 py-3 text-left font-bold text-gray-800 border border-gray-300 bg-red-100 min-w-48">
                    Error
                  </th>
                  <th className="font-extrabold px-4 py-3 text-left text-gray-800 border border-gray-300 bg-gray-100 min-w-24">
                    Row ID
                  </th>

                  {/* All other columns */}
                  {errorRows.length > 0 &&
                    Object.keys(errorRows[0].data)
                      .filter((col) => col.toLowerCase() !== "error")
                      .map((col) => (
                        <th
                          key={col}
                          className="px-4 py-3 text-left font-bold text-gray-800 border border-gray-300 bg-gray-100 min-w-32"
                        >
                          {col}
                        </th>
                      ))}
                </tr>
              </thead>

              <tbody>
                {errorRows.map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Error cell first */}
                    <td className="px-4 py-3 text-red-700 font-semibold border border-gray-300 bg-red-50">
                      {row.data.error}
                    </td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 bg-white">
                      {row.RowID}
                    </td>

                    {/* All other data cells */}
                    {Object.keys(row.data)
                      .filter((col) => col.toLowerCase() !== "error")
                      .map((col) => (
                        <td
                          key={col}
                          className="px-4 py-3 text-gray-700 border border-gray-300 bg-white"
                        >
                          {row.data[col] !== null && row.data[col] !== undefined
                            ? String(row.data[col])
                            : "-"}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p>💡 Tip: Fix the errors above and re-upload the CSV file.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadCSV;