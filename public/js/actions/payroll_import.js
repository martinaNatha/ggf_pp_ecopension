let workbook, sheetData;
var resultJson;
var filename;

document.getElementById("payrollinput").addEventListener("change", function (e) {
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
      const row1 = sheetData[4] || [];
      const row2 = sheetData[9] || [];
      const row3 = sheetData[15] || [];

      // Define the required words
      const requiredHeaders1 = ["Comapss Group Nr"];
      const requiredHeaders2 = ["Number employees"];
      const requiredHeaders = ["ID. Nr.", "Amount"];

      // Check for missing headers in row 1 and row 3
      const missingInRow1 = requiredHeaders1.filter(
        (header) => !row1.includes(header)
      );
      const missingInRow2 = requiredHeaders2.filter(
        (header) => !row2.includes(header)
      );
      const missingInRow3 = requiredHeaders.filter(
        (header) => !row3.includes(header)
      );

      let resultMessage = "";
      if (
        missingInRow1.length === 0 &&
        missingInRow2.length === 0 &&
        missingInRow3.length === 0
      ) {
        resultMessage += "File uploaded!";
        const msg = document.getElementById("payrmsg");
        msg.style.display = "none";
        document.getElementById("sub_button").disabled = false;
        msg.style.color = "green";
        msg.innerText = resultMessage;
        msg.style.display = "block";
      } else {
        if (missingInRow1.length > 0) {
          resultMessage += `Missing headers in row 1: ${missingInRow1.join(
            ", "
          )}.\n`;

          const msg = document.getElementById("payrmsg");
          msg.style.display = "block";
          msg.style.color = "red";
          msg.innerText = resultMessage;
        }
        if (missingInRow2.length > 0) {
          resultMessage += `Missing headers in row 2: ${missingInRow2.join(
            ", "
          )}.\n`;
          const msg = document.getElementById("payrmsg");
          msg.style.display = "block";
          msg.style.color = "red";
          msg.innerText = resultMessage;
        }
        if (missingInRow3.length > 0) {
          resultMessage += `Missing headers in row 4: ${missingInRow3.join(
            ", "
          )}.\n`;
          const msg = document.getElementById("payrmsg");
          msg.style.display = "block";
          msg.style.color = "red";
          msg.innerText = resultMessage;
        }
      }
    };

    reader.readAsArrayBuffer(file);
});

document.getElementById("sub_button").addEventListener("click", function () {
  if (!sheetData) {
    console.log("Please upload a file first!");
    return;
  }

  const B5Value = sheetData[4] ? sheetData[4][1] : "N/A";
  const B8Value = sheetData[7] ? sheetData[7][1] : "N/A";
  const B10Value = sheetData[9] ? sheetData[9][1] : "N/A";
  const B11Value = sheetData[10] ? sheetData[10][1] : "N/A";

  const headers = sheetData[15] || [];

  const birthdateIndex = headers.indexOf("BirthDate");

  function excelSerialDateToJSDate(serial) {
    const excelStartDate = new Date(1900, 0, 1); // January 1, 1900
    const daysOffset = serial - 1; // Excel starts counting from 1
    excelStartDate.setDate(excelStartDate.getDate() + daysOffset);
    return excelStartDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  }

  const dataRows = [];
  for (let i = 16; i < sheetData.length; i++) {
    const rowData = {};
    headers.forEach((header, index) => {
      const cellValue = sheetData[i][index];
      if (cellValue !== undefined && cellValue !== null && cellValue !== "") {
        rowData[header] =
          index === birthdateIndex
            ? excelSerialDateToJSDate(cellValue)
            : cellValue;
      }
    });

    if (Object.keys(rowData).length > 0) {
      dataRows.push(rowData);
    }
  }

  //Create JSON object
  resultJson = {
    Gnummer: B5Value,
    PeriodDate: B8Value,
    NumberEmpl: B10Value,
    TotalPAmount: B11Value,
    data: dataRows,
  };
  console.log(resultJson);
  send_data();
});

async function send_data() {
  const data = {
    jresult: JSON.stringify(resultJson),
    username: user_name,
    filename: filename,
  };
  const result = await fetch("/send_data_payroll", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then((res) => res.json());
  if (result.status == "ok") {
    Swal.fire({
        title: "Success",
        html: "Request send!",
        icon: "success",
      });
    setTimeout(function () {
      window.location.reload();
    }, 2000);
  }else{
    Swal.fire({
        title: "Info",
        html: result.message,
        icon: "info",
      });
  }
}