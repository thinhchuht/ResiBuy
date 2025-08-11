using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResiBuy.Server.Migrations
{
    /// <inheritdoc />
    public partial class deleteunsusedcolumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmailConfirmed",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PhoneNumberConfirmed",
                table: "Users");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 11, 13, 46, 49, 40, DateTimeKind.Local).AddTicks(9618), "$2a$11$Gw1tKEsa/C7a0Lm3UwKeHuntK5vmgrD6WDudGSxOiDz7uiC0aF5ZS", new DateTime(2025, 8, 11, 13, 46, 49, 40, DateTimeKind.Local).AddTicks(9632) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EmailConfirmed",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "PhoneNumberConfirmed",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "EmailConfirmed", "PasswordHash", "PhoneNumberConfirmed", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 9, 15, 6, 39, 341, DateTimeKind.Local).AddTicks(9213), true, "$2a$11$hx7l7gtVKumVZqDQrIxOL.1nnFiC8E0IB0gB3qEGaezexDmYg/jjS", true, new DateTime(2025, 8, 9, 15, 6, 39, 341, DateTimeKind.Local).AddTicks(9267) });
        }
    }
}
