const fs = require('fs');

const filePaths = ['src/pages/CustomerInvoiceBoard.jsx', 'src/pages/DirectBankTransactionBoard.jsx', 'src/pages/JournalEntryBoard.jsx', 'src/pages/CustomerReceiptBoard.jsx', 'src/pages/AdvancePayBoard.jsx', 'src/pages/MainCashBoard.jsx'];

for (const filePath of filePaths) {
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add errors state
  if (!content.includes('const [errors, setErrors] = useState({});')) {
    content = content.replace(/const \[formData, setFormData\] = useState\([^)]+\);/, (match) => {
      return match + '\n    const [errors, setErrors] = useState({});';
    });
  }

  // 2. Clear errors in handleInputChange
  content = content.replace(/setFormData\(prev => \({ \.\.\.prev, \[name\]: value }\)\);/, (match) => {
    return match + '\n        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));';
  });

  fs.writeFileSync(filePath, content);
}
console.log("Partial transformation complete.");
