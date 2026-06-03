$sqlFiles = Get-ChildItem -Filter *_setup.sql
foreach ($file in $sqlFiles) {
    Write-Host "Executing $($file.Name)..."
    sqlcmd -S localhost -E -d Acc_Web -i $file.FullName
}
Write-Host "Executing create_financial_reports_sps.sql..."
sqlcmd -S localhost -E -d Acc_Web -i "create_financial_reports_sps.sql"
