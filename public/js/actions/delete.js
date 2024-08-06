var dataList;
var jsonData;

// wn action sections
$("#wnsingle_button").on("click", function () {
  var wn_a = document.getElementById("wn_value").value;
  if (wn_a.startsWith("A") || wn_a.startsWith("a")) {
    send_delete_data([wn_a], "wn");
  } else {
    Swal.fire({
      title: "Error",
      text: "Please enter a valid Anumber",
      icon: "error",
    });
  }
});

$("#wnmulti_button").on("click", function () {
  send_delete_data(dataList, "wn");
});

$("#wn_value").on("input", function () {
  document.getElementById("wnsingle_button").disabled = false;
});

// wg action sections
$("#wg_value").on("input", function () {
  document.getElementById("wgsingle_button").disabled = false;
});

$("#wgsingle_button").on("click", function () {
  var wg_a = document.getElementById("wg_value").value;
  if (!/[a-zA-Z]/.test(wg_a)) {
    send_delete_data([wg_a], "wg");
  } else {
    Swal.fire({
      title: "Error",
      text: "Please enter a valid NameId",
      icon: "error",
    });
  }
});

$("#wgmulti_button").on("click", function () {
  send_delete_data(dataList, "wg");
});

// upload wn section
document.getElementById('excelwninput').addEventListener('change', wn_file_check);

function wn_file_check(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Define the header value you're looking for
    const headerValue = "MBR_NO"; // Replace with the actual header value you're looking for

    // Find the range of the data
    const range = XLSX.utils.decode_range(worksheet["!ref"]);

    // Search for the target column by header value
    let targetColumn = -1;
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c });
      const cellValue = worksheet[cellAddress] ? worksheet[cellAddress].v : "";
      if (cellValue === headerValue) {
        targetColumn = c;
        break;
      }
    }

    if (targetColumn === -1) {
      Swal.fire({
        title: "Header Not Found",
        text: "The specified header value was not found in the sheet.",
        icon: "error",
      });
      return;
    }

    // Start reading from the second row (excluding the header row)
    range.s.r++;

    // Extract data from the target column (excluding the header row)
    const columnData = [];
    for (let i = range.s.r; i <= range.e.r; i++) {
      const cellAddress = XLSX.utils.encode_cell({ r: i, c: targetColumn });
      const cellValue = worksheet[cellAddress] ? worksheet[cellAddress].v : ""; // Get cell value (or empty string if cell is empty)
      columnData.push(cellValue);
    }

    const filteredColumnData = columnData.filter((value) => value !== "");

    // Check if any value does not start with 'A'
    const nonAValues = filteredColumnData.filter((value) => !value.startsWith("A"));
    var emessage = document.getElementById("Emessage");
    var button = document.getElementById("wnmulti_button");
    if (nonAValues.length > 0) {
      Swal.fire({
        title: "Something went wrong",
        text: "The format and column position is not correctly set, please check the excel sheet",
        icon: "error",
      });
      var computedStyle = window.getComputedStyle(emessage);
      var displayPropertyValue = computedStyle.getPropertyValue("display");
      if (displayPropertyValue === "block") {
        emessage.style.display = "none";
        button.disabled = true;
      }
      return;
    } else {
      emessage.style.opacity = "1";
      button.disabled = false;
    }
    // Add the extracted data from the column to a list
    dataList = columnData.filter(Boolean); // Filter out empty values

    // Display the list in the console
    console.log(dataList);
    // send_data(dataList);
  };

  reader.readAsArrayBuffer(file);
}

// upload wg section
document.getElementById('excelwginput').addEventListener('change', wg_file_check);

function wg_file_check(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Define the header value you're looking for
    const headerValue = "NameId"; // Replace with the actual header value you're looking for

    // Find the range of the data
    const range = XLSX.utils.decode_range(worksheet["!ref"]);

    // Search for the target column by header value
    let targetColumn = -1;
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c });
      const cellValue = worksheet[cellAddress] ? worksheet[cellAddress].v : "";
      if (cellValue === headerValue) {
        targetColumn = c;
        break;
      }
    }

    if (targetColumn === -1) {
      Swal.fire({
        title: "Header Not Found",
        text: "The specified header value was not found in the sheet(NameId)",
        icon: "error",
      });
      return;
    }

    // Start reading from the second row (excluding the header row)
    range.s.r++;

    // Extract data from the target column (excluding the header row)
    const columnData = [];
    for (let i = range.s.r; i <= range.e.r; i++) {
      const cellAddress = XLSX.utils.encode_cell({ r: i, c: targetColumn });
      const cellValue = worksheet[cellAddress] ? worksheet[cellAddress].v : ""; // Get cell value (or empty string if cell is empty)
      columnData.push(cellValue);
    }

    // Check if any value does not start with 'A'
    const nonAValues = columnData.filter((value) => /[a-zA-Z]/.test(value));
    var emessage = document.getElementById("Emessagewg");
    var button = document.getElementById("wgmulti_button");
    if (nonAValues.length > 0) {
      Swal.fire({
        title: "Something went wrong",
        text: "The format and column position is not correctly set, please check the excel sheet",
        icon: "error",
      });
      var computedStyle = window.getComputedStyle(emessage);
      var displayPropertyValue = computedStyle.getPropertyValue("display");
      if (displayPropertyValue === "block") {
        emessage.style.opacity = "0";
        button.disabled = true;
      }
      return;
    } else {
      emessage.style.opacity = "1";
      button.disabled = false;
    }
    // Add the extracted data from the column to a list
    dataList = columnData.filter(Boolean); // Filter out empty values

    // Display the list in the console
    console.log(dataList);
    // send_data(dataList);
  };

  reader.readAsArrayBuffer(file);
}

// send data to orchestrator
async function send_delete_data(data, type) {
  event.preventDefault();

  var amount = data.length;
  if (amount > 1 && type == "wn") {
    var load_box = document.getElementById("box_load");
    load_box.style.opacity = 1;
  } else if (amount > 1 && type == "wg") {
    var load_box = document.getElementById("box_load2");
    load_box.style.opacity = 1;
  }
  data.unshift('finish');
  // data.push('finish');
  var data_info = {
    data,
    email,
    user_name,
    amount,
    type,
  };
 
  const result = await fetch("/send_delete_info", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data_info),
  }).then((res) => res.json());
  if (result.status == "202") {
    if (amount > 1) {
      load_box.style.opacity = 0;
    }
    Swal.fire({
      title: "Success",
      text: `In ` + amount + ` minutes a confirmition email will be send to you, with more info`,
      icon: "success",
    });
  } else {
    function extractJSONFromString(str) {
      const jsonMatch = str.match(/\{.*\}/);
      if (jsonMatch) {
        try {
          const jsonObject = JSON.parse(jsonMatch[0]);
          Swal.fire({
            title: "Error",
            text: jsonObject,
            icon: "error",
          });
          return jsonObject;
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      } else {
        console.error("No JSON found in the string.");
      }
      return null;
    }

    const extractedJSON = extractJSONFromString(result.error);

    Swal.fire({
      title: "Error",
      text: extractedJSON.message,
      icon: "error",
    });
  }
}
