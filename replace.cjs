const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/HomeMaster/SystemSettingsBoard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add new state variables
content = content.replace(
    "const [compSearch, setCompSearch] = useState('');",
    "const [compSearch, setCompSearch] = useState('');\n    const [empSearchTriggered, setEmpSearchTriggered] = useState(false);\n    const [compSearchTriggered, setCompSearchTriggered] = useState(false);"
);

// Replace the Target Selection Sub-Modal content
const startMarker = '<div className="flex flex-col gap-2 h-1/2 min-h-[200px]">';
const endMarker = '<button onClick={() => setShowTargetModal(false)}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const newJSX = `
                        <div className="flex flex-col gap-4 relative z-20">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Search & Select Employee</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                                <input 
                                    type="text" 
                                    placeholder="Search Employee..." 
                                    value={empSearch}
                                    onChange={e => {
                                        setEmpSearch(e.target.value);
                                        setEmpSearchTriggered(false);
                                    }}
                                    onKeyDown={e => e.key === 'Enter' && setEmpSearchTriggered(true)}
                                    className="w-full pl-9 pr-24 p-3 border border-slate-300 rounded-xl text-sm bg-white font-bold text-slate-700 outline-none focus:border-[#00acee] focus:ring-1 focus:ring-[#00acee] transition-all"
                                />
                                <button 
                                    onClick={() => setEmpSearchTriggered(true)}
                                    className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#00acee] hover:bg-[#009adb] text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                                >
                                    Load
                                </button>
                                
                                {empSearchTriggered && (
                                    <div className="absolute top-[100%] mt-2 left-0 w-full z-50 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-[250px] overflow-y-auto flex flex-col">
                                        <div 
                                            onClick={() => {
                                                setSelectedEmployee('');
                                                setEmpSearch('-- All Employees (Global) --');
                                                setEmpSearchTriggered(false);
                                                setSelectedCompany('');
                                                setCompSearch('-- All Companies (Global) --');
                                            }}
                                            className="p-3 border-b border-slate-100 text-sm cursor-pointer transition-all bg-[#00acee]/5 text-[#00acee] font-bold hover:bg-[#00acee]/10"
                                        >
                                            -- All Employees (Global) --
                                        </div>
                                        {(() => {
                                            const filteredEmployees = employees.filter(e => (e.emp_Name || e.empName || '').toLowerCase().includes(empSearch.toLowerCase()) || (e.emp_Code || '').toLowerCase().includes(empSearch.toLowerCase()));
                                            return (
                                                <>
                                                    {filteredEmployees.slice(0, 50).map(e => {
                                                        const roleName = systemRoles.find(r => r.id === e.userRole_Id || r.id === e.role)?.name || 'No Role';
                                                        return (
                                                            <div 
                                                                key={e.emp_Code}
                                                                onClick={() => {
                                                                    setSelectedEmployee(e.emp_Code);
                                                                    setEmpSearch(e.emp_Name || e.empName);
                                                                    setEmpSearchTriggered(false);
                                                                    
                                                                    // Auto-load & auto-select company
                                                                    const empNode = hierarchy.find(h => h.empCode === e.emp_Code || h.emp_Code === e.emp_Code);
                                                                    if (empNode && empNode.companies && empNode.companies.length === 1) {
                                                                        setSelectedCompany(empNode.companies[0].companyCode || empNode.companies[0].company_Code);
                                                                        setCompSearch(empNode.companies[0].companyName || empNode.companies[0].company_Name);
                                                                    } else {
                                                                        setSelectedCompany('');
                                                                        setCompSearch('');
                                                                    }
                                                                }}
                                                                className="p-3 border-b border-slate-100 text-sm cursor-pointer transition-all text-slate-600 hover:bg-slate-50 font-medium"
                                                            >
                                                                {e.emp_Name || e.empName} <span className="text-slate-400 font-normal ml-1">[{roleName}]</span>
                                                            </div>
                                                        );
                                                    })}
                                                    {filteredEmployees.length > 50 && (
                                                        <div className="p-3 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50/50">
                                                            Showing top 50 results. Use search to find more.
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 relative z-10 mt-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Search & Select Company</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                                <input 
                                    type="text" 
                                    placeholder="Search Company..." 
                                    value={compSearch}
                                    onChange={e => {
                                        setCompSearch(e.target.value);
                                        setCompSearchTriggered(false);
                                    }}
                                    onKeyDown={e => e.key === 'Enter' && setCompSearchTriggered(true)}
                                    className="w-full pl-9 pr-24 p-3 border border-slate-300 rounded-xl text-sm bg-white font-bold text-slate-700 outline-none focus:border-[#00acee] focus:ring-1 focus:ring-[#00acee] transition-all"
                                />
                                <button 
                                    onClick={() => setCompSearchTriggered(true)}
                                    className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#00acee] hover:bg-[#009adb] text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                                >
                                    Load
                                </button>

                                {compSearchTriggered && (
                                    <div className="absolute top-[100%] mt-2 left-0 w-full z-50 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-[250px] overflow-y-auto flex flex-col">
                                        <div 
                                            onClick={() => {
                                                setSelectedCompany('');
                                                setCompSearch('-- All Companies (Global) --');
                                                setCompSearchTriggered(false);
                                            }}
                                            className="p-3 border-b border-slate-100 text-sm cursor-pointer transition-all bg-[#00acee]/5 text-[#00acee] font-bold hover:bg-[#00acee]/10"
                                        >
                                            -- All Companies (Global) --
                                        </div>
                                        {(() => {
                                            const filteredCompanies = availableCompanies.filter(c => (c.comp_Name || c.companyName || c.code || '').toLowerCase().includes(compSearch.toLowerCase()));
                                            return (
                                                <>
                                                    {filteredCompanies.slice(0, 50).map(c => (
                                                        <div 
                                                            key={c.code}
                                                            onClick={() => {
                                                                setSelectedCompany(c.code);
                                                                setCompSearch(c.comp_Name || c.companyName || c.code);
                                                                setCompSearchTriggered(false);
                                                            }}
                                                            className="p-3 border-b border-slate-100 text-sm cursor-pointer transition-all text-slate-600 hover:bg-slate-50 font-medium"
                                                        >
                                                            {c.comp_Name || c.companyName || c.code}
                                                        </div>
                                                    ))}
                                                    {filteredCompanies.length > 50 && (
                                                        <div className="p-3 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50/50">
                                                            Showing top 50 results. Use search to find more.
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        `;
    content = content.substring(0, startIndex) + newJSX + content.substring(endIndex);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Successfully replaced modal content.");
} else {
    console.log("Markers not found", startIndex, endIndex);
}
