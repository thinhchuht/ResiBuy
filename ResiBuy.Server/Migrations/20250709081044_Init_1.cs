using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResiBuy.Server.Migrations
{
    /// <inheritdoc />
    public partial class Init_1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Quantity",
                table: "ProductDetails",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 7, 9, 15, 10, 41, 173, DateTimeKind.Local).AddTicks(4643), "$2a$11$6YGeBQa3YfRNxeFLDKKHwOBHRTf58/E43ZJS7jPjR0NdnDJ0FmaV6", new DateTime(2025, 7, 9, 15, 10, 41, 173, DateTimeKind.Local).AddTicks(4665) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "ProductDetails");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 7, 8, 17, 4, 33, 442, DateTimeKind.Local).AddTicks(4494), "$2a$11$vtmxhivuO0PZVNlMjcwOQ.6jRbLdbj2YzHsi/BzOYW2JCIKEVZaby", new DateTime(2025, 7, 8, 17, 4, 33, 442, DateTimeKind.Local).AddTicks(4508) });
        }
    }
}
