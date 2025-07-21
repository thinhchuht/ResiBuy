using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResiBuy.Server.Migrations
{
    /// <inheritdoc />
    public partial class updatenotifydata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Data",
                table: "Notifications",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 7, 21, 17, 31, 6, 249, DateTimeKind.Local).AddTicks(3511), "$2a$11$WnPYI8umPlBdJn4m.R9/h.aBjHFvJW5rrE5Rc3IKPg4Qed/q1ovBq", new DateTime(2025, 7, 21, 17, 31, 6, 249, DateTimeKind.Local).AddTicks(3528) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Data",
                table: "Notifications");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 7, 21, 10, 22, 37, 733, DateTimeKind.Local).AddTicks(2017), "$2a$11$4E/RVaeokwVwotKArkuwd.vPXGGgmXJcC1ltpNwTKs1PgrE44mv/i", new DateTime(2025, 7, 21, 10, 22, 37, 733, DateTimeKind.Local).AddTicks(2031) });
        }
    }
}
