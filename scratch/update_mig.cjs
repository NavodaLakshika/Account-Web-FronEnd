const fs = require('fs');
const path = 'e:\\Project\\Accounts\\Acc-Web_BackEnd\\backend\\Account-Web-Backend\\Acc-Web-API\\Migrations\\20260525034502_AddSubscriptionColumnsManual.cs';
const content = `using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acc_Web_API.Migrations
{
    public partial class AddSubscriptionColumnsManual : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE ACC_Employee ADD First_Login_Date datetime2 NULL;");
            migrationBuilder.Sql("ALTER TABLE ACC_Employee ADD Subscription_End_Date datetime2 NULL;");
            migrationBuilder.Sql("ALTER TABLE ACC_Employee ADD Subscription_Status nvarchar(max) NULL DEFAULT 'Trial';");
            migrationBuilder.Sql("UPDATE ACC_Employee SET Subscription_Status = 'Trial' WHERE Subscription_Status IS NULL;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE ACC_Employee DROP COLUMN First_Login_Date;");
            migrationBuilder.Sql("ALTER TABLE ACC_Employee DROP COLUMN Subscription_End_Date;");
            migrationBuilder.Sql("ALTER TABLE ACC_Employee DROP COLUMN Subscription_Status;");
        }
    }
}
`;
fs.writeFileSync(path, content);
