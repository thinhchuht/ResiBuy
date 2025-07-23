using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResiBuy.Server.Migrations
{
    /// <inheritdoc />
    public partial class updatecancelreason : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CancelReason",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 7, 18, 11, 21, 44, 799, DateTimeKind.Local).AddTicks(7709), "$2a$11$sjipry1u5SeL9fav9aF.P.kuUC6hag2nQBdl9YOJn1zoDcTodHYSO", new DateTime(2025, 7, 18, 11, 21, 44, 799, DateTimeKind.Local).AddTicks(7719) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CancelReason",
                table: "Orders");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 7, 9, 15, 10, 41, 173, DateTimeKind.Local).AddTicks(4643), "$2a$11$6YGeBQa3YfRNxeFLDKKHwOBHRTf58/E43ZJS7jPjR0NdnDJ0FmaV6", new DateTime(2025, 7, 9, 15, 10, 41, 173, DateTimeKind.Local).AddTicks(4665) });
        }
    }
}
