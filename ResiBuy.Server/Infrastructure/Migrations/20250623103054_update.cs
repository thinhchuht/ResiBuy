using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResiBuy.Server.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class update : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiredCheckOutTime",
                table: "Carts",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsCheckingOut",
                table: "Carts",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Carts",
                type: "varbinary(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 6, 23, 17, 30, 54, 497, DateTimeKind.Local).AddTicks(6133), "$2a$11$2ARaYCN6HPMuWeWQ0R48yu1hWQAtvDBfe0OynMgZq8QlkoVE2KHf2", new DateTime(2025, 6, 23, 17, 30, 54, 497, DateTimeKind.Local).AddTicks(6145) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExpiredCheckOutTime",
                table: "Carts");

            migrationBuilder.DropColumn(
                name: "IsCheckingOut",
                table: "Carts");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Carts");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 6, 20, 18, 47, 38, 860, DateTimeKind.Local).AddTicks(7558), "$2a$11$i1UtG5WAPDxkcmSXeVtHTubtwQXwX/YS3M4cMas.JqRiD7HG7VQM6", new DateTime(2025, 6, 20, 18, 47, 38, 860, DateTimeKind.Local).AddTicks(7582) });
        }
    }
}
