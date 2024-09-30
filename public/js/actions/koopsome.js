let workbook, sheetData;
var resultJson;
var filename;

document.getElementById("excelinput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  filename = file.name;

  if (!file) {
    console.error("No file selected!");
    return;
  }

  // Create a FileReader to read the file
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);

    // Read the Excel file using XLSX
    workbook = XLSX.read(data, { type: "array" });

    // Select the first sheet in the workbook
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert the sheet to an array of arrays (header: 1 returns arrays of each row)
    sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(sheetData);
    const row1 = sheetData[0] || [];
    const row3 = sheetData[2] || [];

    // Define the required words
    const requiredHeaders1 = ["Employer"];
    const requiredHeaders = ["Participant Number", "Single Premium"];

    // Check for missing headers in row 1 and row 3
    const missingInRow1 = requiredHeaders1.filter(
      (header) => !row1.includes(header)
    );
    const missingInRow3 = requiredHeaders.filter(
      (header) => !row3.includes(header)
    );

    let resultMessage = "";
    if (missingInRow1.length === 0 && missingInRow3.length === 0) {
      const msg = document.getElementById("koopmsg");
      msg.style.display = "block";
      msg.style.color = "white";
      msg.innerText = "The uploaded file is valid!";
      // get_data_from_excel();
      document.getElementById("sub_button").disabled = false;
    } else {
      if (missingInRow1.length > 0) {
        resultMessage += `Missing headers in row 1: ${missingInRow1.join(
          ", "
        )}.\n`;

        const msg = document.getElementById("koopmsg");
        msg.style.display = "block";
        msg.style.color = "white";
        msg.innerText = resultMessage;
      }
      if (missingInRow3.length > 0) {
        resultMessage += `Missing headers in row 3: ${missingInRow3.join(
          ", "
        )}.\n`;
        const msg = document.getElementById("koopmsg");
        msg.style.display = "block";
        msg.style.color = "white";
        msg.innerText = resultMessage;
      }
    }
    // console.log(resultMessage);
  };

  reader.readAsArrayBuffer(file);
});

document.getElementById("sub_button").addEventListener("click", function () {
  if (!sheetData) {
    console.log("Please upload a file first!");
    return;
  }

  // Get value from cell C1 (row 1, column C, which is index 2 because arrays are 0-indexed)
  const C1Value = sheetData[0] ? sheetData[0][2] : "N/A";

  // Get headers from row 3 (which is sheetData[2])
  const headers = sheetData[2] || [];

  // Get all data under the headers, i.e., rows starting from row 4
  const dataRows = [];
  for (let i = 3; i < sheetData.length; i++) {
    const rowData = {};
    headers.forEach((header, index) => {
      const cellValue = sheetData[i][index];
      // Check if the value is not empty, null, or undefined
      if (cellValue !== undefined && cellValue !== null && cellValue !== "") {
        rowData[header] = cellValue;
      }
    });

    // Only push non-empty rowData
    if (Object.keys(rowData).length > 0) {
      dataRows.push(rowData);
    }
  }

  // Create JSON object
  resultJson = {
    Employer: C1Value,
    data: dataRows,
  };

  // Display the value from C1 and the JSON data
  // console.log(JSON.stringify(resultJson, null, 2));
  send_data();
});

function get_data_from_excel(){
  if (!sheetData) {
    console.log("Please upload a file first!");
    return;
  }
  // Get value from cell C1 (row 1, column C, which is index 2 because arrays are 0-indexed)
  const C1Value = sheetData[0] ? sheetData[0][2] : "N/A";
  // Get headers from row 3 (which is sheetData[2])
  const headers = sheetData[2] || [];
  // Get all data under the headers, i.e., rows starting from row 4
  const dataRows = [];
  for (let i = 3; i < sheetData.length; i++) {
    const rowData = {};
    headers.forEach((header, index) => {
      const cellValue = sheetData[i][index];
      // Check if the value is not empty, null, or undefined
      if (cellValue !== undefined && cellValue !== null && cellValue !== "") {
        rowData[header] = cellValue;
      }
    });
    // Only push non-empty rowData
    if (Object.keys(rowData).length > 0) {
      dataRows.push(rowData);
    }
  }
  // Create JSON object
  resultJson = {
    Employer: C1Value,
    data: dataRows,
  };

  check_if_exist();
}

// async function check_if_exist(){
//   var anummer_amount = resultJson.data.length;
//   var total_amount = resultJson.data.reduce((total, user) => {
//     return total + user["Single Premium"];
//   }, 0);

//   console.log(total_amount)

//   const data ={
//     jresult : JSON.stringify(resultJson),
//     anummers:anummer_amount,
//     total_amount:total_amount,
//     filename:filename
//   }
//   const result = await fetch("/check_if_exists", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   }).then((res) => res.json());
//   if(result.status === "exist"){
//     console.log("Data already exist");
//   }
// }

async function send_data() {
    const data ={
      jresult : JSON.stringify(resultJson),
      username: user_name,
      filename: filename
    }
  const result = await fetch("/send_to_api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then((res) => res.json());
  if(result.status == "202"){
    const box = document.getElementById("msg_cont")
    box.style.display= "flex";
    box.style.opacity= "1";
    setTimeout(function () {
        window.location.reload();
      }, 5000);
  }
}