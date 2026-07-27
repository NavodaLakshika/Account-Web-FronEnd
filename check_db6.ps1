
$connString = "Server=192.168.1.7\onimtait;Database=Acc_Web;User Id=sa;Password=it@onimta1+;TrustServerCertificate=True;"
$conn = New-Object System.Data.SqlClient.SqlConnection($connString)
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ACC_Account_Transaction_Details'"
$reader = $cmd.ExecuteReader()
$cols = @()
while ($reader.Read()) { $cols += $reader["COLUMN_NAME"] }
Write-Host ("Columns: " + ($cols -join ", "))
$conn.Close()

