using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResiBuy.Server.Migrations
{
    /// <inheritdoc />
    public partial class addreportcount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reports_Users_TargetId",
                table: "Reports");

            migrationBuilder.DropIndex(
                name: "IX_Reports_TargetId",
                table: "Reports");

            migrationBuilder.AddColumn<int>(
                name: "ReportCount",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "TargetId",
                table: "Reports",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsResolved",
                table: "Reports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "ReportCount", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 7, 23, 14, 29, 19, 18, DateTimeKind.Local).AddTicks(7681), "$2a$11$lk44dh2uSmEcnbqYxwT9tepxn6IJTSbxqZkOg7e488TBCRcAvx0HG", 0, new DateTime(2025, 7, 23, 14, 29, 19, 18, DateTimeKind.Local).AddTicks(7713) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReportCount",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsResolved",
                table: "Reports");

            migrationBuilder.AlterColumn<string>(
                name: "TargetId",
                table: "Reports",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 7, 21, 17, 31, 6, 249, DateTimeKind.Local).AddTicks(3511), "$2a$11$WnPYI8umPlBdJn4m.R9/h.aBjHFvJW5rrE5Rc3IKPg4Qed/q1ovBq", new DateTime(2025, 7, 21, 17, 31, 6, 249, DateTimeKind.Local).AddTicks(3528) });

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
    }
}
