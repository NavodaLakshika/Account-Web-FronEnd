const axios = require('axios');

async function testPath(path) {
    try {
        const payload = {
            DatabaseName: 'Acc_Web',
            BackupPath: path,
            UserName: 'Test'
        };
        const res = await axios.post('http://localhost:5173/api/Backup/create', payload);
        console.log(`Success for path ${path}:`, res.data);
    } catch (e) {
        console.error(`Error for path ${path}:`, e.response?.data?.message || e.message);
    }
}

async function run() {
    await testPath('C:\\Backup');
    await testPath('C:\\Program Files\\Microsoft SQL Server\\MSSQL13.ONIMTAIT\\MSSQL\\Backup');
}
run();
