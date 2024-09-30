// $.get("/get_info_from_compass", function (result) {});
var tokenEncrypt = sessionStorage.getItem("tokenusers");
var tokenUser = JSON.parse(tokenEncrypt);
var country = tokenUser.country;
get_data(country);

async function get_data(count) {
  const result = await fetch("/get_info_from_compass", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ count }),
  }).then((res) => res.json());
  if(result.status == '202'){
    console.log(result.datawg)
    const content = document.getElementById("eco_content");
    const loader = document.getElementById("info_loader");
  
    content.style.display = "block";
    loader.style.display = "none";
    loader.style.opacity = "0";
  
    document.getElementById("wn").innerText = result.wn;
    document.getElementById("wg").innerText = result.wg;
    // document.getElementById("wnwg").innerText = result.t;
    $("#tbl_eco_user").DataTable({
      data: result.datawn,
      responsive: true,
      columns: [
        { data: "MBR_NO" },
        { data: "CASE_MBR_KEY" },
        { data: "NAMEID" },
        { data: "NATLIDNO" },
        { data: "FIRSTNAME" },
        { data: "LASTNAME" },
        { data: "EXTD_MBR_STATUS" },
        { data: "ORG_NAMEID" },
      ],
      layout: {
        topStart: {
          buttons: [
            {
              extend: "excelHtml5",
              text: '<i class="fa-solid fa-file-excel" style="font-size:22px;vertical-align:middle;"></i>',
              // text: '<img src="media/excel_icon.png" alt="Excel" style="width:25px;height:25px;vertical-align:middle;">',
              titleAttr: "Export to Excel",
              className: "custom-excel-button",
              filename: function () {
                var randomNum = Math.floor(Math.random() * 1000000);
                return "ecopensionfile_" + randomNum;
              },
            },
            {
              extend: "print",
              text: '<i class="fa-solid fa-print" style="font-size:22px;vertical-align:middle;"></i>',
              titleAttr: "Print",
              className: "custom-excel-button",
            },
          ],
        },
      },
    });
  }else{
    Swal.fire({
      title: "Error",
      text: result.err,
      icon: "error",
    });
  }
  
}

// {
//     "MBR_NO": "A181607",
//     "CASE_MBR_KEY": 456771,
//     "NAMEID": 251608,
//     "NATLIDNO": "1993070636",
//     "NAMEPREFIX": null,
//     "FIRSTNAME": "DENNIS",
//     "MIDNAME": null,
//     "LASTNAME": "DIAZ",
//     "BIRTHDT": "1993-07-06 00:00:00",
//     "SEXCD": "1",
//     "EXTD_MBR_STATUS": "Paid Up",
//     "ANN_SALARY": 22879.56,
//     "TOTAL_AVAIL_PREMIUM": 0,
//     "RISK_PREMIUM": 0,
//     "PARTTIME_PCT": 100,
//     "PARTTIME_EFF_DT": null,
//     "SALARY_EFF_DT": "2019-01-01 00:00:00",
//     "DPDT_COUNT": 0,
//     "SPSL_COUNT": null,
//     "MARITAL_CD": "0",
//     "NORMAL_RETIREMENT_DT": "2058-08-01 00:00:00",
//     "JOIN_COMPANY_DT": "2018-09-01 00:00:00",
//     "JOIN_SCHEME_DT": "2019-01-01 00:00:00",
//     "LINE1": null,
//     "LINE2": null,
//     "LINE3": null,
//     "CITY": null,
//     "POSTCD": null,
//     "COUNTRY": null,
//     "COUNTRY_DESC": null,
//     "EMAIL": "dennis93diaz@gmail.com",
//     "PHONE": null,
//     "BIRTH_COUNTRY": null,
//     "NATIONALITY": null,
//     "BNK_ACCT_NO": null,
//     "BNK_NAME": null,
//     "PREMIUM_FRANCHISE_AMT": 0,
//     "BENEFIT_FRANCHISE_AMT": 17300,
//     "SPOUSE_NAME": null,
//     "SPOUSE_MIDNAME": null,
//     "SPOUSE_FIRSTNAME": null,
//     "SPOUSE_DOB": null,
//     "SPOUSE_NAMEID": null,
//     "SPOUSE_GENDER": null,
//     "SPOUSE_NATLIDNO": null,
//     "CASE_KEY": 7559,
//     "MBGP_KEY": 6951,
//     "CREATED_ON": "2024-09-22 19:57:44",
//     "CREATED_BY": "LISTENER",
//     "LAST_MOD_DT": "2024-09-22 19:57:44",
//     "LAST_MOD_USER": "LISTENER",
//     "ORG_NAMEID": 464966,
//     "PORTAL_MEMBER": "Y"
// }
