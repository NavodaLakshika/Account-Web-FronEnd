const fetch = require('node-fetch');
fetch('http://localhost:5046/api/report/trial-balance?companyId=COM001')
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error(err));
