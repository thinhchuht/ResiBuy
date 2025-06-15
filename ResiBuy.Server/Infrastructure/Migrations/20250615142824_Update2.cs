using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResiBuy.Server.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Update2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductImgs");

            migrationBuilder.AddColumn<string>(
                name: "AvatarId",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Sold",
                table: "Products",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Note",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ShippingAddressId",
                table: "Orders",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "Images",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ImgUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ThumbUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Images", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Images_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Images_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "AvatarId", "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { null, new DateTime(2025, 6, 15, 21, 28, 24, 525, DateTimeKind.Local).AddTicks(9981), "$2a$11$pXYKW0/sUOoweVzuqjIAAOO0VqDtn.tnkPyZT5a/YjieN.mvkZ5sm", new DateTime(2025, 6, 15, 21, 28, 24, 525, DateTimeKind.Local).AddTicks(9998) });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_ShippingAddressId",
                table: "Orders",
                column: "ShippingAddressId");

            migrationBuilder.CreateIndex(
                name: "IX_Images_ProductId",
                table: "Images",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Images_UserId",
                table: "Images",
                column: "UserId",
                unique: true,
                filter: "[UserId] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Rooms_ShippingAddressId",
                table: "Orders",
                column: "ShippingAddressId",
                principalTable: "Rooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Rooms_ShippingAddressId",
                table: "Orders");

            migrationBuilder.DropTable(
                name: "Images");

            migrationBuilder.DropIndex(
                name: "IX_Orders_ShippingAddressId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "AvatarId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Sold",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Note",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ShippingAddressId",
                table: "Orders");

            migrationBuilder.CreateTable(
                name: "ProductImgs",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ImgUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ThumbUrl = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductImgs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductImgs_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 6, 14, 20, 43, 20, 163, DateTimeKind.Local).AddTicks(8180), "$2a$11$JE2ws0YkLNdm5MyCugBVCOwdHoDJPIBhORwBG2Tnp/LGBP2NCZave", new DateTime(2025, 6, 14, 20, 43, 20, 163, DateTimeKind.Local).AddTicks(8192) });

            migrationBuilder.CreateIndex(
                name: "IX_ProductImgs_ProductId",
                table: "ProductImgs",
                column: "ProductId");
        }
    }
}
