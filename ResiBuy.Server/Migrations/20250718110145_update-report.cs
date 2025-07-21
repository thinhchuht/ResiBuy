using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResiBuy.Server.Migrations
{
    /// <inheritdoc />
    public partial class updatereport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TargetId",
                table: "Reports",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 7, 18, 18, 1, 44, 959, DateTimeKind.Local).AddTicks(3874), "$2a$11$LZZmIvGgIDag4iHjusATv.IljNpAweFLrp5u9cVMS65VPwJkVkfVi", new DateTime(2025, 7, 18, 18, 1, 44, 959, DateTimeKind.Local).AddTicks(3886) });

            migrationBuilder.CreateIndex(
                name: "IX_Reports_TargetId",
                table: "Reports",
                column: "TargetId");

            migrationBuilder.AddForeignKey(
                name: "FK_Reports_Users_TargetId",
                table: "Reports",
                column: "TargetId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reports_Users_TargetId",
                table: "Reports");

            migrationBuilder.DropIndex(
                name: "IX_Reports_TargetId",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "TargetId",
                table: "Reports");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 7, 18, 11, 21, 44, 799, DateTimeKind.Local).AddTicks(7709), "$2a$11$sjipry1u5SeL9fav9aF.P.kuUC6hag2nQBdl9YOJn1zoDcTodHYSO", new DateTime(2025, 7, 18, 11, 21, 44, 799, DateTimeKind.Local).AddTicks(7719) });
        }
    }
}
