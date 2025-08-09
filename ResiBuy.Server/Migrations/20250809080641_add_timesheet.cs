using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResiBuy.Server.Migrations
{
    /// <inheritdoc />
    public partial class add_timesheet : Migration
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

            migrationBuilder.AddColumn<DateTime>(
                name: "FirstTimeLogin",
                table: "Shippers",
                type: "datetime2",
                nullable: true);

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
                values: new object[] { new DateTime(2025, 8, 9, 15, 6, 39, 341, DateTimeKind.Local).AddTicks(9213), "$2a$11$hx7l7gtVKumVZqDQrIxOL.1nnFiC8E0IB0gB3qEGaezexDmYg/jjS", new DateTime(2025, 8, 9, 15, 6, 39, 341, DateTimeKind.Local).AddTicks(9267) });

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
                name: "IsPayFee",
                table: "Stores");

            migrationBuilder.DropColumn(
                name: "FirstTimeLogin",
                table: "Shippers");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 7, 31, 14, 10, 19, 294, DateTimeKind.Local).AddTicks(5341), "$2a$11$WG.5gWDPzthOylZBKY8O5e7QNx6IPzEzewYkCBdXliDPBC92OQ3Eq", new DateTime(2025, 7, 31, 14, 10, 19, 294, DateTimeKind.Local).AddTicks(5375) });
        }
    }
}
