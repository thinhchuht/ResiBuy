using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResiBuy.Server.Migrations
{
    /// <inheritdoc />
    public partial class addreview : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Rate = table.Column<int>(type: "int", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsAnonymous = table.Column<bool>(type: "bit", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    ProductDetailId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reviews_ProductDetails_ProductDetailId",
                        column: x => x.ProductDetailId,
                        principalTable: "ProductDetails",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reviews_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 7, 25, 15, 28, 35, 499, DateTimeKind.Local).AddTicks(2476), "$2a$11$hPV83SuUzhfCzr5ChZJFLeT6Q0kNx0HW7e.gBRq.KvamCRbZAnakK", new DateTime(2025, 7, 25, 15, 28, 35, 499, DateTimeKind.Local).AddTicks(2490) });

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ProductDetailId",
                table: "Reviews",
                column: "ProductDetailId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_UserId",
                table: "Reviews",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Reviews");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 7, 23, 16, 37, 47, 693, DateTimeKind.Local).AddTicks(4875), "$2a$11$zakEKdrtxzXuj/w9aGceK.pT2MagEgR8.t8vJce7bE470MPLC.Beu", new DateTime(2025, 7, 23, 16, 37, 47, 693, DateTimeKind.Local).AddTicks(4897) });
        }
    }
}
