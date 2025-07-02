using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResiBuy.Server.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class t2 : Migration
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
                values: new object[] { new DateTime(2025, 6, 26, 19, 11, 59, 418, DateTimeKind.Local).AddTicks(9678), "$2a$11$22e7zVve8odkWBlLYomfNORw8uSooQEzCH5Dj8JWBt5XmzRZyyA1q", new DateTime(2025, 6, 26, 19, 11, 59, 418, DateTimeKind.Local).AddTicks(9694) });
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
                values: new object[] { new DateTime(2025, 6, 25, 21, 44, 42, 813, DateTimeKind.Local).AddTicks(1338), "$2a$11$sqwF.x/L/ggIaTMgOsQmK.VK2X.n1FtGzujtuz8t6gabIPaRJeGYO", new DateTime(2025, 6, 25, 21, 44, 42, 813, DateTimeKind.Local).AddTicks(1386) });
        }
    }
}
