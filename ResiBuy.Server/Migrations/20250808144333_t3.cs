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
            migrationBuilder.AddColumn<bool>(
                name: "IsPayFee",
                table: "Stores",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<DateTime>(
                name: "FirstTimeLogin",
                table: "Shippers",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 8, 21, 43, 30, 834, DateTimeKind.Local).AddTicks(2078), "$2a$11$q7DPA2Somw07km405DXBS.cBvSFF8u0Q1KWH0vAMLYAu7ZwcGtMde", new DateTime(2025, 8, 8, 21, 43, 30, 834, DateTimeKind.Local).AddTicks(2095) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPayFee",
                table: "Stores");

            migrationBuilder.AlterColumn<DateTime>(
                name: "FirstTimeLogin",
                table: "Shippers",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 7, 21, 50, 23, 894, DateTimeKind.Local).AddTicks(2725), "$2a$11$tAUHcDA0tRIhD2GXyvKg3eyI/iiXwcfJHsDNTagWmpWaYDysibuKi", new DateTime(2025, 8, 7, 21, 50, 23, 894, DateTimeKind.Local).AddTicks(2744) });
        }
    }
}
