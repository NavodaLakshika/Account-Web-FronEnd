USE Acc_Web;
GO

-- Account 12000 is Accounts Receivable
INSERT INTO ACC_Account_Transaction_Details (Doc_No, Post_Date, Company_Id, Acc_Code, Amount, Credit, Cust_Job, Memo)
VALUES 
('INV-1001', 'May 23 2026 10:00AM', 'COM001', '12000', 5000.00, 0, 'John Doe Inc', 'Invoice for consulting'),
('INV-1002', 'Apr 15 2026 11:00AM', 'COM001', '12000', 2500.00, 0, 'Acme Corp', 'Invoice for software license'),
('INV-1003', 'Mar 01 2026 12:00PM', 'COM001', '12000', 1200.00, 0, 'Global Tech', 'Invoice for maintenance');

-- Account 20000 is Accounts Payable
INSERT INTO ACC_Account_Transaction_Details (Doc_No, Post_Date, Company_Id, Acc_Code, Amount, Credit, Cust_Job, Memo)
VALUES 
('BILL-2001', 'May 20 2026 09:00AM', 'COM001', '20000', 0, 4000.00, 'Office Supplies Co', 'Bill for printer ink'),
('BILL-2002', 'Apr 10 2026 10:00AM', 'COM001', '20000', 0, 1500.00, 'Internet Provider LLC', 'Bill for internet'),
('BILL-2003', 'Mar 05 2026 11:00AM', 'COM001', '20000', 0, 3200.00, 'Consulting Firm', 'Bill for external audit');
