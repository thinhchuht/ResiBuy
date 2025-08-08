using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResiBuy.Server.Migrations
{
    /// <inheritdoc />
    public partial class t2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "FirstTimeLogin",
                table: "Shippers",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateTable(
                name: "TimeSheets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShipperId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DateMark = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsLate = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TimeSheets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TimeSheets_Shippers_ShipperId",
                        column: x => x.ShipperId,
                        principalTable: "Shippers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 7, 21, 50, 23, 894, DateTimeKind.Local).AddTicks(2725), "$2a$11$tAUHcDA0tRIhD2GXyvKg3eyI/iiXwcfJHsDNTagWmpWaYDysibuKi", new DateTime(2025, 8, 7, 21, 50, 23, 894, DateTimeKind.Local).AddTicks(2744) });

            migrationBuilder.CreateIndex(
                name: "IX_TimeSheets_ShipperId",
                table: "TimeSheets",
                column: "ShipperId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TimeSheets");

            migrationBuilder.DropColumn(
                name: "FirstTimeLogin",
                table: "Shippers");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 2, 10, 57, 29, 229, DateTimeKind.Local).AddTicks(4132), "$2a$11$Pto/4vhDqGAxAmSM2efqgOMWEqqMgZD9KP.Q5hs7L572MFZdlLjwO", new DateTime(2025, 8, 2, 10, 57, 29, 229, DateTimeKind.Local).AddTicks(4148) });
        }
    }
}
