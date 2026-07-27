
$connString = "Server=192.168.1.7\onimtait;Database=Acc_Web;User Id=sa;Password=it@onimta1+;TrustServerCertificate=True;"
$conn = New-Object System.Data.SqlClient.SqlConnection($connString)
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT COUNT(*) as cntNull FROM ACC_Transaction_Header WHERE Company_Id = 'COM001' AND Amount IS NULL"
$reader = $cmd.ExecuteReader()
if ($reader.Read()) { Write-Host ("Null Amount: " + $reader["cntNull"]) }
$reader.Close()

$cmd.CommandText = "SELECT COUNT(*) as cntZero FROM ACC_Transaction_Header WHERE Company_Id = 'COM001' AND Amount = 0"
$reader2 = $cmd.ExecuteReader()
if ($reader2.Read()) { Write-Host ("Zero Amount: " + $reader2["cntZero"]) }
$conn.Close()

