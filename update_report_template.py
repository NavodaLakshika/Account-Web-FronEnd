import re

file_path = r"e:\Project\Accounts\Accounts Web\src\components\ReportTemplate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace fetchReportData block
old_fetch = r'''    const fetchReportData = async \(\) => \{
        const endpoint = title\.replace\(/\[\^a-zA-Z0-9 \]/g, ""\)\.split\(' '\)\.map\(w=>w\.toLowerCase\(\)\)\.filter\(Boolean\)\.join\('-'\);
        
        if \(endpoint\) \{
            setApiLoading\(true\);
            try \{
                const companyRaw = localStorage\.getItem\('selectedCompany'\);
                const company = companyRaw \? JSON\.parse\(companyRaw\) : null;
                const companyId = company\?\.companyCode \|\| company\?\.CompanyCode \|\| company\?\.Company_Code \|\| company\?\.Code \|\| company\?\.Company_Id \|\| company\?\.companyId \|\| company\?\.code \|\| company\?\.id \|\| '';
                
                const apiUrl = import\.meta\.env\.VITE_API_URL;
                const response = await fetch\(`\$\{apiUrl\}/api/report/\$\{endpoint\}\?companyId=\$\{companyId\}`\);'''

new_fetch = '''    const fetchReportData = async () => {
        const endpoint = title.replace(/[^a-zA-Z0-9 ]/g, "").split(' ').map(w=>w.toLowerCase()).filter(Boolean).join('-');
        
        if (endpoint) {
            setApiLoading(true);
            try {
                const companyRaw = localStorage.getItem('selectedCompany');
                const company = companyRaw ? JSON.parse(companyRaw) : null;
                const companyId = company?.companyCode || company?.CompanyCode || company?.Company_Code || company?.Code || company?.Company_Id || company?.companyId || company?.code || company?.id || '';
                
                let startStr = '';
                let endStr = '';
                if (asOfDate) {
                    const parts = asOfDate.split('/');
                    if (parts.length === 3) {
                        const dd = parseInt(parts[0], 10);
                        const mm = parseInt(parts[1], 10);
                        const yyyy = parseInt(parts[2], 10);
                        const endD = new Date(yyyy, mm - 1, dd);
                        let startD = new Date(endD);
                        
                        if (reportPeriod === 'Today') {
                            startD = new Date(endD);
                        } else if (reportPeriod === 'This Week') {
                            const day = startD.getDay();
                            const diff = startD.getDate() - day + (day === 0 ? -6 : 1);
                            startD.setDate(diff);
                        } else if (reportPeriod === 'This Month') {
                            startD = new Date(startD.getFullYear(), startD.getMonth(), 1);
                        } else if (reportPeriod === 'This Year') {
                            startD = new Date(startD.getFullYear(), 0, 1);
                        }
                        
                        const pad = (n) => n < 10 ? '0' + n : n;
                        startStr = `${startD.getFullYear()}-${pad(startD.getMonth() + 1)}-${pad(startD.getDate())}`;
                        endStr = `${endD.getFullYear()}-${pad(endD.getMonth() + 1)}-${pad(endD.getDate())}`;
                    }
                }
                
                const apiUrl = import.meta.env.VITE_API_URL;
                const response = await fetch(`${apiUrl}/api/report/${endpoint}?companyId=${companyId}&startDate=${startStr}&endDate=${endStr}`);'''

content = re.sub(old_fetch, new_fetch, content)

# Update useEffect dependencies
old_dep = r'    \}, \[title\]\);'
new_dep = r'    }, [title, reportPeriod, asOfDate]);'
content = re.sub(old_dep, new_dep, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
