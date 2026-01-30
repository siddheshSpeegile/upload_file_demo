import React from 'react'
import UploadCSV from './Components/UploadCSV.jsx' 
// import UploadExcel from './Components/UploadExcelOldFile.jsx'

const App = () => {
  return (
    <>
      <div style={{ margin: "20px" }}>
      
      <UploadCSV />
      {/* <UploadExcel /> */}
    </div>

    </>
  )
}

export default App