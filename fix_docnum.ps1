$conn = New-Object System.Data.SqlClient.SqlConnection("Server=192.168.1.7\onimtait;Database=Acc_Web;User Id=sa;Password=it@onimta1+;TrustServerCertificate=True")
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT definition FROM sys.sql_modules WHERE object_id = OBJECT_ID('ACC_sp_CallDocNumber')"
$conn.Open()
$def = $cmd.ExecuteScalar()
$conn.Close()

if ($def) {
    $def = $def -replace 'CREATE\s+PROCEDURE', 'ALTER PROCEDURE' -replace '6-LEN', '7-LEN'
    Set-Content "docnum_fixed.sql" $def
    Write-Host "Success"
} else {
    Write-Host "Failed to get definition"
}
