
$connString = "Server=192.168.1.7\onimtait;Database=Acc_Web;User Id=sa;Password=it@onimta1+;TrustServerCertificate=True;"
$conn = New-Object System.Data.SqlClient.SqlConnection($connString)
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT TOP 10 Company_Id, Doc_No, Amount, Iid, Acc_Type FROM ACC_Transaction_Header WHERE Company_Id = 'COM001' ORDER BY Post_Date DESC"
$reader = $cmd.ExecuteReader()
while ($reader.Read()) {
    Write-Host ("Company: " + $reader["Company_Id"] + ", Doc: " + $reader["Doc_No"] + ", Amount: " + $reader["Amount"] + ", Iid: " + $reader["Iid"] + ", AccType: " + $reader["Acc_Type"])
}
$conn.Close()

