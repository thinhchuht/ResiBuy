using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResiBuy.Server.Migrations
{
    /// <inheritdoc />
    public partial class addupdatedAtreview : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Reviews",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 7, 31, 14, 10, 19, 294, DateTimeKind.Local).AddTicks(5341), "$2a$11$WG.5gWDPzthOylZBKY8O5e7QNx6IPzEzewYkCBdXliDPBC92OQ3Eq", new DateTime(2025, 7, 31, 14, 10, 19, 294, DateTimeKind.Local).AddTicks(5375) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Reviews");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 7, 25, 15, 28, 35, 499, DateTimeKind.Local).AddTicks(2476), "$2a$11$hPV83SuUzhfCzr5ChZJFLeT6Q0kNx0HW7e.gBRq.KvamCRbZAnakK", new DateTime(2025, 7, 25, 15, 28, 35, 499, DateTimeKind.Local).AddTicks(2490) });
        }
    }
}
