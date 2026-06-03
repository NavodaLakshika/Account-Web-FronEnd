const response = await fetch('http://localhost:5046/api/report/trial-balance?companyId=COM001');
const data = await response.json();
console.log(JSON.stringify(data, null, 2));
