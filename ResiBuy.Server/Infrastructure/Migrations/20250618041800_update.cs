using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResiBuy.Server.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class update : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 6, 18, 11, 18, 0, 346, DateTimeKind.Local).AddTicks(8705), "$2a$11$WC82WSQtBSzIPVSBHp3FjeLHOYI1QBmfP3/ziGEjlIgIIPA5njZUm", new DateTime(2025, 6, 18, 11, 18, 0, 346, DateTimeKind.Local).AddTicks(8720) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 6, 18, 1, 47, 56, 583, DateTimeKind.Local).AddTicks(6426), "$2a$11$IitenmplatJ2Xr8kiEHc.OFsvlHhK17E.QliY7vHpsxJI0zceCEV2", new DateTime(2025, 6, 18, 1, 47, 56, 583, DateTimeKind.Local).AddTicks(6450) });
        }
    }
}
