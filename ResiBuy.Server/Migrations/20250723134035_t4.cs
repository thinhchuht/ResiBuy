using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResiBuy.Server.Migrations
{
    /// <inheritdoc />
    public partial class t4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reports_OrderId",
                table: "Reports");

            migrationBuilder.AddColumn<int>(
                name: "ReportCount",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "Stores",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsLocked",
                table: "Shippers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsResolved",
                table: "Reports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "ReportTarget",
                table: "Reports",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TargetId",
                table: "Reports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CancelReason",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Data",
                table: "Notifications",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "ReportCount", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 7, 23, 20, 40, 33, 242, DateTimeKind.Local).AddTicks(9270), "$2a$11$Z0ygQbH2kltZgmI47VcAI.GcX1dw1b3H/gJ96GpNW/srtYzKFN83y", 0, new DateTime(2025, 7, 23, 20, 40, 33, 242, DateTimeKind.Local).AddTicks(9290) });

            migrationBuilder.CreateIndex(
                name: "IX_Reports_OrderId",
                table: "Reports",
                column: "OrderId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reports_OrderId",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "ReportCount",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "Stores");

            migrationBuilder.DropColumn(
                name: "IsLocked",
                table: "Shippers");

            migrationBuilder.DropColumn(
                name: "IsResolved",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "ReportTarget",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "TargetId",
                table: "Reports");

            migrationBuilder.DropColumn(
                name: "CancelReason",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Data",
                table: "Notifications");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 7, 12, 15, 59, 37, 442, DateTimeKind.Local).AddTicks(9397), "$2a$11$Fyh6gC/KTV9Jxb2W3fypTe/f/Q0L7hIhhO0pH/b7LxJzNDh0uCjZ.", new DateTime(2025, 7, 12, 15, 59, 37, 442, DateTimeKind.Local).AddTicks(9413) });

            migrationBuilder.CreateIndex(
                name: "IX_Reports_OrderId",
                table: "Reports",
                column: "OrderId");
        }
    }
}
