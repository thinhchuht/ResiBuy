using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResiBuy.Server.Migrations
{
    /// <inheritdoc />
    public partial class addreporttartget : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ReportTarget",
                table: "Reports",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 7, 23, 14, 37, 27, 48, DateTimeKind.Local).AddTicks(64), "$2a$11$exEz2xt.ZwVqGvWT/BwMuOuP4eZRZ67ZXCzFjQkJ2oFaYA6DtOy06", new DateTime(2025, 7, 23, 14, 37, 27, 48, DateTimeKind.Local).AddTicks(77) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReportTarget",
                table: "Reports");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 7, 23, 14, 29, 19, 18, DateTimeKind.Local).AddTicks(7681), "$2a$11$lk44dh2uSmEcnbqYxwT9tepxn6IJTSbxqZkOg7e488TBCRcAvx0HG", new DateTime(2025, 7, 23, 14, 29, 19, 18, DateTimeKind.Local).AddTicks(7713) });
        }
    }
}
