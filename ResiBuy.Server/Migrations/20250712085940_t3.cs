using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResiBuy.Server.Migrations
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
                values: new object[] { new DateTime(2025, 7, 12, 15, 59, 37, 442, DateTimeKind.Local).AddTicks(9397), "$2a$11$Fyh6gC/KTV9Jxb2W3fypTe/f/Q0L7hIhhO0pH/b7LxJzNDh0uCjZ.", new DateTime(2025, 7, 12, 15, 59, 37, 442, DateTimeKind.Local).AddTicks(9413) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 7, 9, 15, 10, 41, 173, DateTimeKind.Local).AddTicks(4643), "$2a$11$6YGeBQa3YfRNxeFLDKKHwOBHRTf58/E43ZJS7jPjR0NdnDJ0FmaV6", new DateTime(2025, 7, 9, 15, 10, 41, 173, DateTimeKind.Local).AddTicks(4665) });
        }
    }
}
