import os
import re

replacements = {
    "Customer Cheque Return Protocol": "Customer Cheque Return",
    "ADVANCED DOCUMENT DISCOVERY - TRANSACTION ARCHIVE": "Document Search",
    "Cheque In Hand (CIH) Inventory Control": "Cheque In Hand (CIH)",
    "Supplier Master Directory": "Supplier Master",
    "Long Term Liability Registry": "Long Term Liability",
    "Cheque Printing Utility": "Cheque Printing",
    "Bank Direct Transaction": "Bank Transaction",
    "Bill Management": "Enter Bill",
    "Not Presented Outward Cheques Register": "Not Presented Cheques",
    "Reversal Entry Form": "Reversal Entry",
    "Cheque Management": "Write Cheque",
    "Assets Depreciation Rate Registry": "Depreciation Rate",
    "New Fixed Assets Item": "Fixed Assets",
    "All Reminders & Tasks": "Reminders",
    "General Journal Entries": "Journal Entry",
    "Customer Profile & Directory": "Customer Master",
    "Advance Issued (Advance Pay)": "Advance Issued",
    "Item Master Database": "Item Master",
    "Card Sale Commission Rate": "Commission Rate",
    "Cheque Book Inventory Registration": "Cheque Book Entry",
    "Profit & Loss Intelligence Center": "Profit & Loss",
    "Bulk Good Received Note (Bulk GRN)": "Bulk GRN",
    "Business Intelligence & Marketing Intelligence Tool": "Marketing Tool",
    "Bank Reconciliation Board": "Bank Reconciliation",
    "Account Master Configuration  Definition Portal": "Account Master",
    "Expenses & Spend Intelligence Center": "Expenses Dashboard",
    "Security - Change Password": "Change Password",
    "Good Received Note (GRN)": "Good Received Note",
    "Archive Retrieval & Intelligent Search": "Search Archive",
    "Register a new company workspace": "Create Company",
    "Account Master Configuration \ufffd Definition Portal": "Account Master"
}

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    original = content
    for old, new in replacements.items():
        # Match 'title="old"' or `title="old"` or title='old'
        content = re.sub(rf'title=([\'\"\`]){re.escape(old)}([\'\"\`])', rf'title=\g<1>{new}\g<2>', content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(r'e:\Project\Accounts\Accounts Web\src'):
    for f in files:
        if f.endswith('.jsx'):
            update_file(os.path.join(root, f))
