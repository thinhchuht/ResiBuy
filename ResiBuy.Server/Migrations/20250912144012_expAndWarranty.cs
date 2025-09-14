using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ResiBuy.Server.Migrations
{
    /// <inheritdoc />
    public partial class expAndWarranty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "09202e2a-c6a2-49bd-8119-9ea1f9bfc07b");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "0f02d5a6-0ae3-4473-9a00-2f3d03506fa4");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "2dd836a4-5aae-4b1d-ba71-e1bf0626ae9b");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "337a1dca-fa3f-49a0-a6ed-96091533a2fc");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "3b9a1516-989a-4dc7-88c0-e24b6c858a66");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "4920aaf0-176c-4e1a-bd52-a16519849758");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "86b0532d-bf59-4492-8b57-516be4e3b035");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "b3b91ad5-a2d4-4dfb-ad0b-fd45df1e9591");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "d7a19834-211d-4f75-8c81-88892d48c4c4");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "f1f9c7a9-616e-4a08-a31f-59b10a104b95");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "f9a480a7-1f50-4446-86d7-dc2aef3c1eeb");

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("2b8011c1-85f9-44eb-afc7-49dbcdfc2a73"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("2e40482e-8569-4ad3-9e14-1196d1a0d588"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("4159de0c-105f-48bb-aaf9-332be8e118f4"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("4a471b55-2bd1-4171-b7da-9db1ce456a19"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("59fb90b2-94aa-4be3-a7ce-e68207e47d0f"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("6ae4d8c1-48af-496c-945e-b47bba80e9bf"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("72a1e78f-f43e-4bd7-857b-b7ba9e5421e3"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("81fe9380-98eb-463b-a6c9-c62fae606249"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("9a902a27-b9af-4167-8c49-88b866b5f66e"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("bb608469-80f7-4218-8470-9034d9dcc4ff"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("ff1e4b27-922b-4a6d-b6ef-1c4168028728"));

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiryDate",
                table: "Products",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WarrantyMonths",
                table: "Products",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Barcodes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProductDetailId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Barcodes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Barcodes_ProductDetails_ProductDetailId",
                        column: x => x.ProductDetailId,
                        principalTable: "ProductDetails",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Name", "Status" },
                values: new object[,]
                {
                    { new Guid("0aea769d-5aba-41a0-b22e-8dbe55928c03"), "Thời trang", true },
                    { new Guid("109e67c9-fe2a-4990-879f-be61c5ece68e"), "Thực phẩm", true },
                    { new Guid("22dba952-c462-4dc4-948b-a8db4c658b08"), "Khác", true },
                    { new Guid("327b5d18-30fc-4b15-85f5-89d9d6076e19"), "Đồ chơi", true },
                    { new Guid("471c874a-fd30-4b97-8929-cde2c0d9ec6f"), "Đồ gia dụng", true },
                    { new Guid("697d16f9-c024-4973-aef9-1eb93e4028ac"), "Thể thao", true },
                    { new Guid("6e81c119-f6f4-4044-9cc3-e5884546ca0a"), "Mỹ phẩm", true },
                    { new Guid("77c3d933-eead-4dbb-bd28-28904fb2db20"), "Sách", true },
                    { new Guid("a7a0b410-011f-4c00-be1e-e3997972f739"), "Phụ kiện", true },
                    { new Guid("d342f922-5da9-462e-8141-c044a36943a7"), "Đồ điện tử", true },
                    { new Guid("d40884bb-7f90-4c1c-99dc-6fd22247f94d"), "Nội thất", true }
                });

            migrationBuilder.UpdateData(
                table: "Stores",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "CreatedAt",
                value: new DateTime(2025, 9, 12, 21, 40, 11, 522, DateTimeKind.Local).AddTicks(4104));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 12, 21, 40, 11, 522, DateTimeKind.Local).AddTicks(3458), "$2a$11$NiEQc8OGArLAYbBY3u.k4Or1ahPdmLCqIDcYv4yNa7sM.bgTlLh/K", new DateTime(2025, 9, 12, 21, 40, 11, 522, DateTimeKind.Local).AddTicks(3478) });

            migrationBuilder.InsertData(
                table: "Images",
                columns: new[] { "Id", "CategoryId", "Name", "ProductDetailId", "ThumbUrl", "Url", "UserId" },
                values: new object[,]
                {
                    { "01faeefa-d593-4f51-82f2-33c047fba805", new Guid("327b5d18-30fc-4b15-85f5-89d9d6076e19"), "dochoi.png", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/dochoi_rz7pys", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/dochoi_rz7pys.png", null },
                    { "1e6ad66b-3f61-4226-8b79-fbaba8071928", new Guid("0aea769d-5aba-41a0-b22e-8dbe55928c03"), "thoitrang.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thoitrang_usekdn", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/thoitrang_usekdn.jpg", null },
                    { "22b97a2c-dcd2-4451-ae13-e8c2d0b43210", new Guid("d40884bb-7f90-4c1c-99dc-6fd22247f94d"), "noithat.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/noithat_steelt", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/noithat_steelt.jpg", null },
                    { "29561dca-251e-45fc-a5af-092f1b9a3108", new Guid("109e67c9-fe2a-4990-879f-be61c5ece68e"), "thucpham.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thucpham_la23wq", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/thucpham_la23wq.jpg", null },
                    { "2c1486a8-5ab3-4143-8bbc-d205bf77f08c", new Guid("22dba952-c462-4dc4-948b-a8db4c658b08"), "khac1.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/other", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756315891/other.jpg", null },
                    { "47e245e9-6d0c-4d2f-9af4-606acf3a0043", new Guid("471c874a-fd30-4b97-8929-cde2c0d9ec6f"), "dogiadung.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/dogiadung_u5cuyh", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/dogiadung_u5cuyh.jpg", null },
                    { "5890da3b-7804-49f4-9990-0a2724d9b608", new Guid("6e81c119-f6f4-4044-9cc3-e5884546ca0a"), "mypham.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/mypham_iltnhv", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/mypham_iltnhv.jpg", null },
                    { "99368038-a18e-43b4-a2c8-e787d95cca81", new Guid("d342f922-5da9-462e-8141-c044a36943a7"), "thu-mua-do-dien-tu-1.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/string", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314488/string.jpg", null },
                    { "9be9f050-14b6-4f88-bf5d-2cff46c6da94", new Guid("77c3d933-eead-4dbb-bd28-28904fb2db20"), "sach.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/sach_w9rqwe", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/sach_w9rqwe.jpg", null },
                    { "cf54ca8a-5eaa-459a-8379-616fec27ecc9", new Guid("a7a0b410-011f-4c00-be1e-e3997972f739"), "phukien.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/phukien_sct8nd", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/phukien_sct8nd.jpg", null },
                    { "e17d8404-c726-4ae0-b8f6-567e92e4ebde", new Guid("697d16f9-c024-4973-aef9-1eb93e4028ac"), "thethao.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thethao_mv34he", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/thethao_mv34he.jpg", null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Barcodes_ProductDetailId",
                table: "Barcodes",
                column: "ProductDetailId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Barcodes");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "01faeefa-d593-4f51-82f2-33c047fba805");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "1e6ad66b-3f61-4226-8b79-fbaba8071928");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "22b97a2c-dcd2-4451-ae13-e8c2d0b43210");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "29561dca-251e-45fc-a5af-092f1b9a3108");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "2c1486a8-5ab3-4143-8bbc-d205bf77f08c");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "47e245e9-6d0c-4d2f-9af4-606acf3a0043");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "5890da3b-7804-49f4-9990-0a2724d9b608");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "99368038-a18e-43b4-a2c8-e787d95cca81");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "9be9f050-14b6-4f88-bf5d-2cff46c6da94");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "cf54ca8a-5eaa-459a-8379-616fec27ecc9");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "e17d8404-c726-4ae0-b8f6-567e92e4ebde");

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("0aea769d-5aba-41a0-b22e-8dbe55928c03"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("109e67c9-fe2a-4990-879f-be61c5ece68e"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22dba952-c462-4dc4-948b-a8db4c658b08"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("327b5d18-30fc-4b15-85f5-89d9d6076e19"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("471c874a-fd30-4b97-8929-cde2c0d9ec6f"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("697d16f9-c024-4973-aef9-1eb93e4028ac"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("6e81c119-f6f4-4044-9cc3-e5884546ca0a"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("77c3d933-eead-4dbb-bd28-28904fb2db20"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("a7a0b410-011f-4c00-be1e-e3997972f739"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("d342f922-5da9-462e-8141-c044a36943a7"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("d40884bb-7f90-4c1c-99dc-6fd22247f94d"));

            migrationBuilder.DropColumn(
                name: "ExpiryDate",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "WarrantyMonths",
                table: "Products");

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Name", "Status" },
                values: new object[,]
                {
                    { new Guid("2b8011c1-85f9-44eb-afc7-49dbcdfc2a73"), "Đồ gia dụng", true },
                    { new Guid("2e40482e-8569-4ad3-9e14-1196d1a0d588"), "Đồ chơi", true },
                    { new Guid("4159de0c-105f-48bb-aaf9-332be8e118f4"), "Khác", true },
                    { new Guid("4a471b55-2bd1-4171-b7da-9db1ce456a19"), "Phụ kiện", true },
                    { new Guid("59fb90b2-94aa-4be3-a7ce-e68207e47d0f"), "Thời trang", true },
                    { new Guid("6ae4d8c1-48af-496c-945e-b47bba80e9bf"), "Mỹ phẩm", true },
                    { new Guid("72a1e78f-f43e-4bd7-857b-b7ba9e5421e3"), "Thực phẩm", true },
                    { new Guid("81fe9380-98eb-463b-a6c9-c62fae606249"), "Thể thao", true },
                    { new Guid("9a902a27-b9af-4167-8c49-88b866b5f66e"), "Đồ điện tử", true },
                    { new Guid("bb608469-80f7-4218-8470-9034d9dcc4ff"), "Sách", true },
                    { new Guid("ff1e4b27-922b-4a6d-b6ef-1c4168028728"), "Nội thất", true }
                });

            migrationBuilder.UpdateData(
                table: "Stores",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "CreatedAt",
                value: new DateTime(2025, 9, 7, 14, 13, 31, 150, DateTimeKind.Local).AddTicks(7853));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 7, 14, 13, 31, 150, DateTimeKind.Local).AddTicks(7400), "$2a$11$mso1tAsshOF6A3R7ZzAAv.qjr60TjfCk5yTFarKIjqK05Pjf0321i", new DateTime(2025, 9, 7, 14, 13, 31, 150, DateTimeKind.Local).AddTicks(7413) });

            migrationBuilder.InsertData(
                table: "Images",
                columns: new[] { "Id", "CategoryId", "Name", "ProductDetailId", "ThumbUrl", "Url", "UserId" },
                values: new object[,]
                {
                    { "09202e2a-c6a2-49bd-8119-9ea1f9bfc07b", new Guid("2b8011c1-85f9-44eb-afc7-49dbcdfc2a73"), "dogiadung.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/dogiadung_u5cuyh", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/dogiadung_u5cuyh.jpg", null },
                    { "0f02d5a6-0ae3-4473-9a00-2f3d03506fa4", new Guid("72a1e78f-f43e-4bd7-857b-b7ba9e5421e3"), "thucpham.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thucpham_la23wq", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/thucpham_la23wq.jpg", null },
                    { "2dd836a4-5aae-4b1d-ba71-e1bf0626ae9b", new Guid("59fb90b2-94aa-4be3-a7ce-e68207e47d0f"), "thoitrang.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thoitrang_usekdn", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/thoitrang_usekdn.jpg", null },
                    { "337a1dca-fa3f-49a0-a6ed-96091533a2fc", new Guid("9a902a27-b9af-4167-8c49-88b866b5f66e"), "thu-mua-do-dien-tu-1.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/string", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314488/string.jpg", null },
                    { "3b9a1516-989a-4dc7-88c0-e24b6c858a66", new Guid("bb608469-80f7-4218-8470-9034d9dcc4ff"), "sach.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/sach_w9rqwe", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/sach_w9rqwe.jpg", null },
                    { "4920aaf0-176c-4e1a-bd52-a16519849758", new Guid("ff1e4b27-922b-4a6d-b6ef-1c4168028728"), "noithat.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/noithat_steelt", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/noithat_steelt.jpg", null },
                    { "86b0532d-bf59-4492-8b57-516be4e3b035", new Guid("81fe9380-98eb-463b-a6c9-c62fae606249"), "thethao.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thethao_mv34he", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/thethao_mv34he.jpg", null },
                    { "b3b91ad5-a2d4-4dfb-ad0b-fd45df1e9591", new Guid("2e40482e-8569-4ad3-9e14-1196d1a0d588"), "dochoi.png", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/dochoi_rz7pys", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/dochoi_rz7pys.png", null },
                    { "d7a19834-211d-4f75-8c81-88892d48c4c4", new Guid("4159de0c-105f-48bb-aaf9-332be8e118f4"), "khac1.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/other", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756315891/other.jpg", null },
                    { "f1f9c7a9-616e-4a08-a31f-59b10a104b95", new Guid("6ae4d8c1-48af-496c-945e-b47bba80e9bf"), "mypham.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/mypham_iltnhv", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/mypham_iltnhv.jpg", null },
                    { "f9a480a7-1f50-4446-86d7-dc2aef3c1eeb", new Guid("4a471b55-2bd1-4171-b7da-9db1ce456a19"), "phukien.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/phukien_sct8nd", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/phukien_sct8nd.jpg", null }
                });
        }
    }
}
