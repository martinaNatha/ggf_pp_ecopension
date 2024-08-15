(async function () {
  get_data();
})();

async function get_data() {
  $.get("/get_users", function (result) {
    // $('#result').html('<pre>' + JSON.stringify(data, null, 2) + '</pre>');
    var result_data = result.data;
    console.log(result_data.length)
    document.getElementById("useramount").innerText =result_data.length;
  }).fail(function (jqXHR, textStatus, errorThrown) {
    $("#result").html("Error: " + textStatus);
    Swal.fire({
      title: "Error",
      text: textStatus,
      icon: "error",
    });
  });
}




// function processData(data) {
//     const typeAmounts = {};

//     data.forEach(item => {
//         const type = item.type;
//         const amount = parseInt(item.amount_anumber, 10);

//         if (typeAmounts[type]) {
//             typeAmounts[type] += amount;
//         } else {
//             typeAmounts[type] = amount;
//         }
//     });

//     return {
//         labels: Object.keys(typeAmounts),
//         values: Object.values(typeAmounts)
//     };
// }

// // Create the pie chart
// function createPieChart(data) {
//     const ctx = document.getElementById('myPieChart').getContext('2d');
//     const { labels, values } = processData(data);

//     new Chart(ctx, {
//         type: 'pie',
//         data: {
//             labels: labels,
//             datasets: [{
//                 data: values,
//                 backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
//             }]
//         },
//         options: {
//             responsive: true,
//             plugins: {
//                 legend: {
//                     position: 'top',
//                 },
//                 title: {
//                     display: true,
//                     text: 'Amount by Type'
//                 }
//             }
//         }
//     });
// }
