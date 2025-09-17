using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ResiBuy.Server.Migrations
{
    /// <inheritdoc />
    public partial class t1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Name", "Status" },
                values: new object[,]
                {
                    { new Guid("00e691b8-b6b8-4fcb-bc4d-c612f5f4ae60"), "Sách", true },
                    { new Guid("0124976d-6fd4-426a-965e-8248669b7b1c"), "Thể thao", true },
                    { new Guid("3047837b-8a8a-467e-bd6f-c378000dcd11"), "Khác", true },
                    { new Guid("6848695f-23a2-4340-ac7c-fafb55b6139c"), "Mỹ phẩm", true },
                    { new Guid("75e1a8bc-d4a1-4e28-9112-0e3a219e7990"), "Phụ kiện", true },
                    { new Guid("b43c7856-e9f4-438b-933f-813e7c5bfa9f"), "Thực phẩm", true },
                    { new Guid("b7c6e2e2-ab4b-4ce8-80e3-f468ccf98127"), "Đồ chơi", true },
                    { new Guid("d9de9b24-5543-4262-aac7-c148c80dfdfe"), "Đồ điện tử", true },
                    { new Guid("dac507c8-2209-445e-9bc9-533a3b5f53a7"), "Đồ gia dụng", true },
                    { new Guid("feb872fa-9195-4ead-899e-753f90cba3fc"), "Thời trang", true },
                    { new Guid("ff86b982-dcb5-4021-9f7f-ac4fdb455c5c"), "Nội thất", true }
                });

            migrationBuilder.InsertData(
                table: "Promotions",
                columns: new[] { "Id", "Discount", "EndDate", "IsActive", "Name", "StartDate" },
                values: new object[] { 1, 0, new DateTime(2225, 9, 17, 21, 43, 30, 374, DateTimeKind.Local).AddTicks(8412), false, "No Promotion", new DateTime(2025, 9, 17, 21, 43, 30, 374, DateTimeKind.Local).AddTicks(8411) });

            migrationBuilder.UpdateData(
                table: "Stores",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "CreatedAt",
                value: new DateTime(2025, 9, 17, 21, 43, 30, 374, DateTimeKind.Local).AddTicks(8407));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 17, 21, 43, 30, 374, DateTimeKind.Local).AddTicks(7933), "$2a$11$ayJzFsg7/scibM7qxullV.tdf/b0OlngB7gwe4ThP0bsAfR3aj/ve", new DateTime(2025, 9, 17, 21, 43, 30, 374, DateTimeKind.Local).AddTicks(7948) });

            migrationBuilder.InsertData(
                table: "Images",
                columns: new[] { "Id", "CategoryId", "Name", "ProductDetailId", "ThumbUrl", "Url", "UserId" },
                values: new object[,]
                {
                    { "1a9ea8f6-0a5b-458b-9b5f-f68312aea6d4", new Guid("feb872fa-9195-4ead-899e-753f90cba3fc"), "thoitrang.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thoitrang_usekdn", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/thoitrang_usekdn.jpg", null },
                    { "22fd67ff-ddfa-47bd-abd8-bbb1cacdc4cc", new Guid("75e1a8bc-d4a1-4e28-9112-0e3a219e7990"), "phukien.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/phukien_sct8nd", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/phukien_sct8nd.jpg", null },
                    { "26a3ecd5-0f3d-47f8-a2c8-ae839cb91fcb", new Guid("b43c7856-e9f4-438b-933f-813e7c5bfa9f"), "thucpham.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thucpham_la23wq", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/thucpham_la23wq.jpg", null },
                    { "5e7915a9-d954-4701-802b-264306b6c9b5", new Guid("00e691b8-b6b8-4fcb-bc4d-c612f5f4ae60"), "sach.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/sach_w9rqwe", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/sach_w9rqwe.jpg", null },
                    { "63b729ac-7a83-4625-aeb7-0b8c391c1fa2", new Guid("d9de9b24-5543-4262-aac7-c148c80dfdfe"), "thu-mua-do-dien-tu-1.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/string", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314488/string.jpg", null },
                    { "6bba2d6b-e3ed-4399-8809-5c2cee8bb31c", new Guid("6848695f-23a2-4340-ac7c-fafb55b6139c"), "mypham.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/mypham_iltnhv", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/mypham_iltnhv.jpg", null },
                    { "7e8f0815-fd4c-4acd-9e4f-b4f4ab8e0d07", new Guid("3047837b-8a8a-467e-bd6f-c378000dcd11"), "khac1.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/other", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756315891/other.jpg", null },
                    { "8060538c-796b-4096-8145-bb7102ba7bfb", new Guid("ff86b982-dcb5-4021-9f7f-ac4fdb455c5c"), "noithat.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/noithat_steelt", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/noithat_steelt.jpg", null },
                    { "9df21b2b-e59a-4fda-bd35-58b7919dda1a", new Guid("0124976d-6fd4-426a-965e-8248669b7b1c"), "thethao.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thethao_mv34he", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/thethao_mv34he.jpg", null },
                    { "e6b40c4a-67dc-4f56-87a1-29c1185d516e", new Guid("b7c6e2e2-ab4b-4ce8-80e3-f468ccf98127"), "dochoi.png", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/dochoi_rz7pys", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/dochoi_rz7pys.png", null },
                    { "ee2bf2e1-864c-4edb-92c3-d375aac533e9", new Guid("dac507c8-2209-445e-9bc9-533a3b5f53a7"), "dogiadung.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/dogiadung_u5cuyh", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/dogiadung_u5cuyh.jpg", null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "1a9ea8f6-0a5b-458b-9b5f-f68312aea6d4");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "22fd67ff-ddfa-47bd-abd8-bbb1cacdc4cc");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "26a3ecd5-0f3d-47f8-a2c8-ae839cb91fcb");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "5e7915a9-d954-4701-802b-264306b6c9b5");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "63b729ac-7a83-4625-aeb7-0b8c391c1fa2");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "6bba2d6b-e3ed-4399-8809-5c2cee8bb31c");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "7e8f0815-fd4c-4acd-9e4f-b4f4ab8e0d07");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "8060538c-796b-4096-8145-bb7102ba7bfb");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "9df21b2b-e59a-4fda-bd35-58b7919dda1a");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "e6b40c4a-67dc-4f56-87a1-29c1185d516e");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "ee2bf2e1-864c-4edb-92c3-d375aac533e9");

            migrationBuilder.DeleteData(
                table: "Promotions",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("00e691b8-b6b8-4fcb-bc4d-c612f5f4ae60"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("0124976d-6fd4-426a-965e-8248669b7b1c"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("3047837b-8a8a-467e-bd6f-c378000dcd11"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("6848695f-23a2-4340-ac7c-fafb55b6139c"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("75e1a8bc-d4a1-4e28-9112-0e3a219e7990"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("b43c7856-e9f4-438b-933f-813e7c5bfa9f"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("b7c6e2e2-ab4b-4ce8-80e3-f468ccf98127"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("d9de9b24-5543-4262-aac7-c148c80dfdfe"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("dac507c8-2209-445e-9bc9-533a3b5f53a7"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("feb872fa-9195-4ead-899e-753f90cba3fc"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("ff86b982-dcb5-4021-9f7f-ac4fdb455c5c"));

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
        }
    }
}
