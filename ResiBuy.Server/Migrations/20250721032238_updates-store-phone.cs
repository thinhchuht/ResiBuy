using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResiBuy.Server.Migrations
{
    /// <inheritdoc />
    public partial class updatesstorephone : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "Stores",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 7, 21, 10, 22, 37, 733, DateTimeKind.Local).AddTicks(2017), "$2a$11$4E/RVaeokwVwotKArkuwd.vPXGGgmXJcC1ltpNwTKs1PgrE44mv/i", new DateTime(2025, 7, 21, 10, 22, 37, 733, DateTimeKind.Local).AddTicks(2031) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "Stores");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 7, 18, 18, 1, 44, 959, DateTimeKind.Local).AddTicks(3874), "$2a$11$LZZmIvGgIDag4iHjusATv.IljNpAweFLrp5u9cVMS65VPwJkVkfVi", new DateTime(2025, 7, 18, 18, 1, 44, 959, DateTimeKind.Local).AddTicks(3886) });
        }
    }
}
