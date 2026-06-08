using System;
using System.Data.SqlClient;

class Program {
    static void Main() {
        try {
            using (SqlConnection conn = new SqlConnection("Server=192.168.1.7\onimtait;Database=Acc_Web;User Id=sa;Password=it@onimta1+;TrustServerCertificate=True;")) {
                conn.Open();
                SqlCommand cmd = new SqlCommand("SELECT ROUTINE_NAME, ROUTINE_DEFINITION FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE='PROCEDURE' AND ROUTINE_NAME LIKE 'ACC_sp_Get%'", conn);
                SqlDataReader reader = cmd.ExecuteReader();
                while(reader.Read()) {
                    string name = reader.GetString(0);
                    string def = reader.GetString(1);
                    if(def.Contains("WHERE 1=0") || def.Contains("dummy")) {
                        Console.WriteLine(name);
                    }
                }
            }
        } catch(Exception ex) {
            Console.WriteLine(ex.Message);
        }
    }
}
