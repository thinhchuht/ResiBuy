using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResiBuy.Server.Migrations
{
    /// <inheritdoc />
    public partial class changecategorystatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<bool>(
                name: "Status",
                table: "Categories",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 11, 14, 24, 42, 81, DateTimeKind.Local).AddTicks(651), "$2a$11$KYoW.o7GsPRHDVNMmwk/ZOVVh9LMYHNsJFulMnsh9JL.a8oX.0w8m", new DateTime(2025, 8, 11, 14, 24, 42, 81, DateTimeKind.Local).AddTicks(666) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Categories",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 11, 13, 46, 49, 40, DateTimeKind.Local).AddTicks(9618), "$2a$11$Gw1tKEsa/C7a0Lm3UwKeHuntK5vmgrD6WDudGSxOiDz7uiC0aF5ZS", new DateTime(2025, 8, 11, 13, 46, 49, 40, DateTimeKind.Local).AddTicks(9632) });
        }
    }
}
