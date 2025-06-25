using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResiBuy.Server.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class db1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<float>(
                name: "Weight",
                table: "ProductDetails",
                type: "real",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 6, 25, 23, 4, 45, 10, DateTimeKind.Local).AddTicks(4240), "$2a$11$bMpr9c00lCyVP.lbnO.Skes6aCMWx6gW3G36xzsiGpiFyY35PBkga", new DateTime(2025, 6, 25, 23, 4, 45, 10, DateTimeKind.Local).AddTicks(4276) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "Weight",
                table: "ProductDetails",
                type: "int",
                nullable: false,
                oldClrType: typeof(float),
                oldType: "real");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 6, 25, 20, 39, 32, 298, DateTimeKind.Local).AddTicks(9580), "$2a$11$1099ozw2lL0v4cKTUl6VPuku4wKNWgxJ0.AB7TgBWEIKVYKcyoE72", new DateTime(2025, 6, 25, 20, 39, 32, 298, DateTimeKind.Local).AddTicks(9599) });
        }
    }
}
