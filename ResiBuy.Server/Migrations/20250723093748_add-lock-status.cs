using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResiBuy.Server.Migrations
{
    /// <inheritdoc />
    public partial class addlockstatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reports_OrderId",
                table: "Reports");

            migrationBuilder.AddColumn<bool>(
                name: "IsLocked",
                table: "Shippers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 7, 23, 16, 37, 47, 693, DateTimeKind.Local).AddTicks(4875), "$2a$11$zakEKdrtxzXuj/w9aGceK.pT2MagEgR8.t8vJce7bE470MPLC.Beu", new DateTime(2025, 7, 23, 16, 37, 47, 693, DateTimeKind.Local).AddTicks(4897) });

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
                name: "IsLocked",
                table: "Shippers");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 7, 23, 14, 37, 27, 48, DateTimeKind.Local).AddTicks(64), "$2a$11$exEz2xt.ZwVqGvWT/BwMuOuP4eZRZ67ZXCzFjQkJ2oFaYA6DtOy06", new DateTime(2025, 7, 23, 14, 37, 27, 48, DateTimeKind.Local).AddTicks(77) });

            migrationBuilder.CreateIndex(
                name: "IX_Reports_OrderId",
                table: "Reports",
                column: "OrderId");
        }
    }
}
