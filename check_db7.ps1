
$connString = "Server=192.168.1.7\onimtait;Database=Acc_Web;User Id=sa;Password=it@onimta1+;TrustServerCertificate=True;"
$conn = New-Object System.Data.SqlClient.SqlConnection($connString)
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT COUNT(*) as cnt FROM ACC_Account_Transaction_Details WHERE Company_Id = 'COM001' AND Amount > 0"
$reader = $cmd.ExecuteReader()
if ($reader.Read()) { Write-Host ("Detail Amount > 0: " + $reader["cnt"]) }
$reader.Close()
$cmd.CommandText = "SELECT COUNT(*) as cnt FROM ACC_Account_Transaction_Details WHERE Company_Id = 'COM001'"
$reader = $cmd.ExecuteReader()
if ($reader.Read()) { Write-Host ("Total Detail Tx: " + $reader["cnt"]) }
$conn.Close()

