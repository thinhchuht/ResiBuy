using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResiBuy.Server.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Update : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdditionalData2s");

            migrationBuilder.DropTable(
                name: "AdditionalData1s");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProductImgs",
                table: "ProductImgs");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "ProductImgs");

            migrationBuilder.AddColumn<string>(
                name: "Id",
                table: "ProductImgs",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: ""); 

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProductImgs",
                table: "ProductImgs",
                column: "Id");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "ProductImgs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ThumbUrl",
                table: "ProductImgs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CostData",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CostData", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CostData_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UncostData",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CostDataId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UncostData", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UncostData_CostData_CostDataId",
                        column: x => x.CostDataId,
                        principalTable: "CostData",
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
                name: "IX_CostData_ProductId",
                table: "CostData",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_UncostData_CostDataId",
                table: "UncostData",
                column: "CostDataId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UncostData");

            migrationBuilder.DropTable(
                name: "CostData");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "ProductImgs");

            migrationBuilder.DropColumn(
                name: "ThumbUrl",
                table: "ProductImgs");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "ProductImgs",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)")
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.CreateTable(
                name: "AdditionalData1s",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdditionalData1s", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AdditionalData1s_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AdditionalData2s",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AdditionalData1Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdditionalData2s", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AdditionalData2s_AdditionalData1s_AdditionalData1Id",
                        column: x => x.AdditionalData1Id,
                        principalTable: "AdditionalData1s",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 6, 14, 10, 26, 27, 599, DateTimeKind.Local).AddTicks(9842), "$2a$11$OGtYO1RrNlEq3y20y2ErG.2akZHsfE..99VQ2dVH.GaXr2WStuFVy", new DateTime(2025, 6, 14, 10, 26, 27, 599, DateTimeKind.Local).AddTicks(9858) });

            migrationBuilder.CreateIndex(
                name: "IX_AdditionalData1s_ProductId",
                table: "AdditionalData1s",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_AdditionalData2s_AdditionalData1Id",
                table: "AdditionalData2s",
                column: "AdditionalData1Id");
        }
    }
}
