
$connString = "Server=192.168.1.7\onimtait;Database=Acc_Web;User Id=sa;Password=it@onimta1+;TrustServerCertificate=True;"
$conn = New-Object System.Data.SqlClient.SqlConnection($connString)
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT COUNT(*) as cnt FROM ACC_Transaction_Header WHERE Company_Id = 'COM001' AND Amount > 0"
$reader = $cmd.ExecuteReader()
if ($reader.Read()) {
    Write-Host ("Transactions with Amount > 0: " + $reader["cnt"])
}
$conn.Close()

