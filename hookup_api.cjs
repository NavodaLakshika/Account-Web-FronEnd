const fs = require('fs');
let content = fs.readFileSync('src/components/ReportTemplate.jsx', 'utf8');

// 1. Add fetch logic inside ReportTemplate
const fetchLogic = `
    const [apiData, setApiData] = useState(null);
    const [apiLoading, setApiLoading] = useState(false);

    useEffect(() => {
        const fetchReportData = async () => {
            let endpoint = '';
            if (title === 'Profit and Loss') endpoint = 'profit-and-loss';
            else if (title === 'Balance Sheet') endpoint = 'balance-sheet';
            else if (title === 'Trial Balance') endpoint = 'trial-balance';
            
            if (endpoint) {
                setApiLoading(true);
                try {
                    // Assuming CompanyId is 'C01' for now.
                    const response = await fetch(\`http://localhost:5132/api/reports/\${endpoint}?companyId=C01\`);
                    if (response.ok) {
                        const json = await response.json();
                        setApiData(json);
                    }
                } catch (error) {
                    console.error("Failed to fetch report data", error);
                } finally {
                    setApiLoading(false);
                }
            } else {
                setApiData(null);
            }
        };
        fetchReportData();
    }, [title]);

    // Use API data if available, otherwise fallback to props
    const displayData = apiData || data;
    
    // Automatically generate columns if apiData is present and columns prop is empty
    const displayColumns = (apiData && apiData.length > 0 && columns.length === 0) 
        ? Object.keys(apiData[0]).map(key => ({ header: key, accessor: key }))
        : columns;
`;

// Insert the logic just before defaultCustomizations
content = content.replace(
    'const defaultCustomizations = {',
    fetchLogic + '\n    const defaultCustomizations = {'
);

// Replace data with displayData and columns with displayColumns in the Table render
content = content.replace(
    /<tbody>\s*\{data\.map/g,
    '<tbody>\n                            {apiLoading ? <tr><td colSpan="100%" className="text-center py-4">Loading data from database...</td></tr> : displayData.map'
);
content = content.replace(
    /\{columns\.map/g,
    '{displayColumns.map'
);

fs.writeFileSync('src/components/ReportTemplate.jsx', content);
