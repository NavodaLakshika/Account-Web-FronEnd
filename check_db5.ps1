
$connString = "Server=192.168.1.7\onimtait;Database=Acc_Web;User Id=sa;Password=it@onimta1+;TrustServerCertificate=True;"
$conn = New-Object System.Data.SqlClient.SqlConnection($connString)
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT TOP 5 Doc_No, Amount, Debit, Credit FROM ACC_Account_Transaction_Details WHERE Company_Id = 'COM001'"
$reader = $cmd.ExecuteReader()
while ($reader.Read()) { Write-Host ("Detail Doc: " + $reader["Doc_No"] + ", Amount: " + $reader["Amount"] + ", Debit: " + $reader["Debit"] + ", Credit: " + $reader["Credit"]) }
$conn.Close()

