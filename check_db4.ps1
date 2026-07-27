
$connString = "Server=192.168.1.7\onimtait;Database=Acc_Web;User Id=sa;Password=it@onimta1+;TrustServerCertificate=True;"
$conn = New-Object System.Data.SqlClient.SqlConnection($connString)
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT COUNT(*) as cntTotal FROM ACC_Transaction_Header WHERE Company_Id = 'COM001'"
$reader = $cmd.ExecuteReader()
if ($reader.Read()) { Write-Host ("Total Tx: " + $reader["cntTotal"]) }
$conn.Close()

