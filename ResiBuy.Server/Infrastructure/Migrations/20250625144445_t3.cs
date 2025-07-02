using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResiBuy.Server.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class t3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 6, 25, 21, 44, 42, 813, DateTimeKind.Local).AddTicks(1338), "$2a$11$sqwF.x/L/ggIaTMgOsQmK.VK2X.n1FtGzujtuz8t6gabIPaRJeGYO", new DateTime(2025, 6, 25, 21, 44, 42, 813, DateTimeKind.Local).AddTicks(1386) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 6, 25, 20, 39, 32, 298, DateTimeKind.Local).AddTicks(9580), "$2a$11$1099ozw2lL0v4cKTUl6VPuku4wKNWgxJ0.AB7TgBWEIKVYKcyoE72", new DateTime(2025, 6, 25, 20, 39, 32, 298, DateTimeKind.Local).AddTicks(9599) });
        }
    }
}
