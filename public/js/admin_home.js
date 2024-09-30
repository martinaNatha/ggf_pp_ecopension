var wndata;
var tokenEncrypt = sessionStorage.getItem("tokenusers");
var tokenUser = JSON.parse(tokenEncrypt);
var country = tokenUser.country;

if (country == "Curacao" && tokenUser.username == "admineco") {
  compass_info("");
} else if (country == "Curacao" && tokenUser.username == "adminecocur") {
  compass_info("Curacao");
} else {
  compass_info("Aruba");
}

async function compass_info(count) {
  const result = await fetch("/get_info_from_compass", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ count }),
  }).then((res) => res.json());
  wndata = result.datawn;
  console.log(result.datawg);
  document.getElementById("wnnum").innerText = result.wn;
  document.getElementById("wgnum").innerText = result.wg;
  // document.getElementById("wtotal").innerText = result.t;
  get_data(count);
  createPieChart(wndata);
  createLineChart(wndata);
  const loader = document.getElementById("admin_load");
  const cont = document.getElementById("admin_contentb");
  loader.style.display = "none";
  cont.style.display = "block";
  cont.style.opacity = "1";

}

async function get_data(cou) {
  const result = await fetch("/get_users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cou }),
  }).then((res) => res.json());
  var result_data = result.data;
  console.log(result_data.length);
  document.getElementById("useramount").innerText = result_data.length;
}

// // Create the pie chart
function processData(data) {
  const typeCounts = {
    Active: 0,
    "Paid-up": 0,
  };

  // Count the number of "Active" and "Paid-up" accounts
  data.forEach((item) => {
    // Normalize the status by converting it to lowercase and trimming spaces
    const type = item.EXTD_MBR_STATUS.trim().toLowerCase();

    if (type === "active") {
      typeCounts.Active += 1;
    } else if (type === "paid-up" || type === "paid up") {
      // Handle different spellings
      typeCounts["Paid-up"] += 1;
    }
  });

  return {
    labels: Object.keys(typeCounts),
    values: Object.values(typeCounts),
  };
}

// // Create the pie chart
function createPieChart(data) {
  const ctx = document.getElementById("myPieChart").getContext("2d");
  const { labels, values } = processData(data); // Pass the 'data' to processData

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: values,
          backgroundColor: ["#FF6384", "#36A2EB"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "WN Active vs Paid-up Accounts",
        },
      },
    },
  });
}

// // Create line chart
function processDataByDate(data) {
  const yearCounts = {};

  data.forEach((item) => {
    // Extract the year from the date (JOIN_SCHEME_DT is in "YYYY-MM-DD HH:MM:SS" format)
    const year = item.JOIN_SCHEME_DT.split("-")[0]; // Extract only the year part

    if (yearCounts[year]) {
      yearCounts[year] += 1; // Increment count for the year
    } else {
      yearCounts[year] = 1;
    }
  });

  // Sort the years in ascending order
  const sortedYears = Object.keys(yearCounts).sort((a, b) => a - b);

  // Return the sorted years and their corresponding counts
  return {
    labels: sortedYears, // Sorted years for the X-axis
    values: sortedYears.map((year) => yearCounts[year]), // Corresponding counts for the Y-axis
  };
}

function createLineChart(data) {
  const ctx = document.getElementById("lineChart").getContext("2d");
  const { labels, values } = processDataByDate(data); // Group data by year

  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels, // X-axis: years
      datasets: [
        {
          label: "Accounts Per Year",
          data: values, // Y-axis: counts per year
          fill: false,
          borderColor: "#36A2EB",
          backgroundColor: "#36A2EB",
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
        },
        title: {
          display: true,
          text: "Accounts Created Per Year",
        },
      },
      scales: {
        x: {
          beginAtZero: true,
        },
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

// Call the function with your data
