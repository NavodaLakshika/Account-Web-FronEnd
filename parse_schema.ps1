$lines = Get-Content schema_headers.txt
$tables = @{}
foreach ($line in $lines) {
    if ($line.Length -gt 30) {
        $tableName = $line.Substring(0, 30).Trim()
        $colName = $line.Substring(97).Trim()
        if ($tableName -ne "TABLE_NAME" -and $tableName -ne "------------------------------" -and $tableName -ne "") {
            if (-not $tables.ContainsKey($tableName)) {
                $tables[$tableName] = @()
            }
            $tables[$tableName] += $colName
        }
    }
}
$output = ""
foreach ($key in $tables.Keys) {
    $output += "Table: $key`nColumns: " + ($tables[$key] -join ", ") + "`n`n"
}
Set-Content -Path "db_schema_summary.txt" -Value $output
