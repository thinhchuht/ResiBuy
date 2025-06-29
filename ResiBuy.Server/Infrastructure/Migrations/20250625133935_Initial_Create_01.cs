using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResiBuy.Server.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Initial_Create_01 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Weight",
                table: "Products");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 6, 25, 20, 39, 32, 298, DateTimeKind.Local).AddTicks(9580), "$2a$11$1099ozw2lL0v4cKTUl6VPuku4wKNWgxJ0.AB7TgBWEIKVYKcyoE72", new DateTime(2025, 6, 25, 20, 39, 32, 298, DateTimeKind.Local).AddTicks(9599) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<float>(
                name: "Weight",
                table: "Products",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 6, 23, 17, 30, 54, 497, DateTimeKind.Local).AddTicks(6133), "$2a$11$2ARaYCN6HPMuWeWQ0R48yu1hWQAtvDBfe0OynMgZq8QlkoVE2KHf2", new DateTime(2025, 6, 23, 17, 30, 54, 497, DateTimeKind.Local).AddTicks(6145) });
        }
    }
}
