using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ResiBuy.Server.Migrations
{
    /// <inheritdoc />
    public partial class mmm : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "08fc8862-11c3-4436-9a01-4397f3139cc1");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "1eb3bb55-cd70-41f5-8d6e-e0082c3aa0e8");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "20cc04da-a4a7-4253-9ec8-b35ac485f97c");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "2c2c3302-c9b9-4ab6-8bd8-f2a73ae5c8e6");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "33e2b638-2c74-47d5-a2d9-890ca2d1c168");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "66d727d4-971a-4e40-ae00-3943ac0987f4");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "73541469-311e-4400-a3ea-c88b90509514");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "84eb848c-8c2b-4fb4-9683-4c7bd7a7c0fe");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "87d99411-7cfa-4412-a074-c7668f9cb0fb");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "a62075a2-bdfb-4a73-ae6e-1ff4fce89327");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "b9877bf9-33ff-42f8-9759-7ebb50ae8f4d");

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("07d5f391-3149-400d-90dd-b010b3c88d12"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("1aecc41f-e59f-436f-a007-51ba763111de"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("38afad7d-ae2c-4fc9-a1be-9d0458b141d4"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("577ca9d1-ad6e-42bd-91e2-5007966e6738"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("6e168ac2-f409-4106-a189-4ce100fb0c3c"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("77369d62-19e7-42cc-8237-fa2e446ac1b6"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("781564ee-2602-41d2-a760-500f2d8c7b86"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("7ee87a89-ba0c-41e0-b1d4-f455a1596a6d"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("87a4d44c-6675-48cf-b2ac-dbee73c2d369"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("ebde5960-f59e-4b3e-ac2f-cecca3c964f9"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("f6df1558-4679-4dfa-91e5-c2b6bb934f32"));

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Name", "Status" },
                values: new object[,]
                {
                    { new Guid("2b74ff47-0753-489e-b475-939fbf090cc8"), "Đồ gia dụng", true },
                    { new Guid("71983420-b7b7-4394-86c6-9835e10ed0df"), "Thời trang", true },
                    { new Guid("9f763e26-bbf4-4608-ac7e-4d83a26ea940"), "Mỹ phẩm", true },
                    { new Guid("a2747dd2-fe87-4709-8e39-5ae83a2e80c3"), "Khác", true },
                    { new Guid("a57bb77b-e240-400e-aeb3-ffb0541eb6e8"), "Đồ chơi", true },
                    { new Guid("a5f0ed90-cc04-415e-9268-0450fb5ce07b"), "Thực phẩm", true },
                    { new Guid("ada725ac-50fe-47de-8e5b-724f78cf54eb"), "Sách", true },
                    { new Guid("be7419fc-469e-4287-ab06-4dd0efc99fe6"), "Thể thao", true },
                    { new Guid("e85e9291-1598-4e88-bc43-6c3f151b14b3"), "Phụ kiện", true },
                    { new Guid("f2ab22dd-7125-444f-96ec-38b8772bdd18"), "Đồ điện tử", true },
                    { new Guid("faba4d2b-c19c-41a6-a539-4595478f7fc3"), "Nội thất", true }
                });

            migrationBuilder.UpdateData(
                table: "Promotions",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "EndDate", "StartDate" },
                values: new object[] { new DateTime(2225, 9, 20, 19, 28, 24, 471, DateTimeKind.Local).AddTicks(9631), new DateTime(2025, 9, 20, 19, 28, 24, 471, DateTimeKind.Local).AddTicks(9630) });

            migrationBuilder.UpdateData(
                table: "Stores",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "CreatedAt",
                value: new DateTime(2025, 9, 20, 19, 28, 24, 471, DateTimeKind.Local).AddTicks(9626));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 20, 19, 28, 24, 471, DateTimeKind.Local).AddTicks(8954), "$2a$11$u.7UveWg19lOogHcsjXs0eaaqA2vPA/djWKLa9dsRV0sfuJw5f2S6", new DateTime(2025, 9, 20, 19, 28, 24, 471, DateTimeKind.Local).AddTicks(8975) });

            migrationBuilder.InsertData(
                table: "Images",
                columns: new[] { "Id", "CategoryId", "Name", "ProductDetailId", "ThumbUrl", "Url", "UserId" },
                values: new object[,]
                {
                    { "085145d1-07a8-48c5-ab01-15208c9a500b", new Guid("f2ab22dd-7125-444f-96ec-38b8772bdd18"), "thu-mua-do-dien-tu-1.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/string", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314488/string.jpg", null },
                    { "086ccadd-238e-4d79-8f3d-1e336425caca", new Guid("be7419fc-469e-4287-ab06-4dd0efc99fe6"), "thethao.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thethao_mv34he", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/thethao_mv34he.jpg", null },
                    { "0a972d12-9e39-4ad5-b2bf-333f7f516574", new Guid("a2747dd2-fe87-4709-8e39-5ae83a2e80c3"), "khac1.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/other", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756315891/other.jpg", null },
                    { "1dddb9f1-496e-43cc-9f9c-820395e2f9f8", new Guid("a5f0ed90-cc04-415e-9268-0450fb5ce07b"), "thucpham.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thucpham_la23wq", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/thucpham_la23wq.jpg", null },
                    { "1e82a467-a515-480f-a186-6076366fae79", new Guid("a57bb77b-e240-400e-aeb3-ffb0541eb6e8"), "dochoi.png", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/dochoi_rz7pys", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/dochoi_rz7pys.png", null },
                    { "655d22ce-57ef-456f-8525-fb6f2f46199e", new Guid("faba4d2b-c19c-41a6-a539-4595478f7fc3"), "noithat.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/noithat_steelt", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/noithat_steelt.jpg", null },
                    { "719e2312-4b77-4a2a-9242-e87435830a14", new Guid("e85e9291-1598-4e88-bc43-6c3f151b14b3"), "phukien.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/phukien_sct8nd", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/phukien_sct8nd.jpg", null },
                    { "b2f092c2-7934-424c-b298-382b963d4dd3", new Guid("71983420-b7b7-4394-86c6-9835e10ed0df"), "thoitrang.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thoitrang_usekdn", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/thoitrang_usekdn.jpg", null },
                    { "d9887ba0-0b15-4afe-afeb-98313f10a214", new Guid("2b74ff47-0753-489e-b475-939fbf090cc8"), "dogiadung.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/dogiadung_u5cuyh", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/dogiadung_u5cuyh.jpg", null },
                    { "e321893b-0163-49b9-a79e-43910af56097", new Guid("9f763e26-bbf4-4608-ac7e-4d83a26ea940"), "mypham.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/mypham_iltnhv", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/mypham_iltnhv.jpg", null },
                    { "fca1435d-caf9-49f7-9e06-7d3beca3b270", new Guid("ada725ac-50fe-47de-8e5b-724f78cf54eb"), "sach.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/sach_w9rqwe", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/sach_w9rqwe.jpg", null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "085145d1-07a8-48c5-ab01-15208c9a500b");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "086ccadd-238e-4d79-8f3d-1e336425caca");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "0a972d12-9e39-4ad5-b2bf-333f7f516574");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "1dddb9f1-496e-43cc-9f9c-820395e2f9f8");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "1e82a467-a515-480f-a186-6076366fae79");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "655d22ce-57ef-456f-8525-fb6f2f46199e");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "719e2312-4b77-4a2a-9242-e87435830a14");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "b2f092c2-7934-424c-b298-382b963d4dd3");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "d9887ba0-0b15-4afe-afeb-98313f10a214");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "e321893b-0163-49b9-a79e-43910af56097");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "fca1435d-caf9-49f7-9e06-7d3beca3b270");

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("2b74ff47-0753-489e-b475-939fbf090cc8"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("71983420-b7b7-4394-86c6-9835e10ed0df"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("9f763e26-bbf4-4608-ac7e-4d83a26ea940"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("a2747dd2-fe87-4709-8e39-5ae83a2e80c3"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("a57bb77b-e240-400e-aeb3-ffb0541eb6e8"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("a5f0ed90-cc04-415e-9268-0450fb5ce07b"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("ada725ac-50fe-47de-8e5b-724f78cf54eb"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("be7419fc-469e-4287-ab06-4dd0efc99fe6"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("e85e9291-1598-4e88-bc43-6c3f151b14b3"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("f2ab22dd-7125-444f-96ec-38b8772bdd18"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("faba4d2b-c19c-41a6-a539-4595478f7fc3"));

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Name", "Status" },
                values: new object[,]
                {
                    { new Guid("07d5f391-3149-400d-90dd-b010b3c88d12"), "Nội thất", true },
                    { new Guid("1aecc41f-e59f-436f-a007-51ba763111de"), "Thời trang", true },
                    { new Guid("38afad7d-ae2c-4fc9-a1be-9d0458b141d4"), "Mỹ phẩm", true },
                    { new Guid("577ca9d1-ad6e-42bd-91e2-5007966e6738"), "Khác", true },
                    { new Guid("6e168ac2-f409-4106-a189-4ce100fb0c3c"), "Đồ chơi", true },
                    { new Guid("77369d62-19e7-42cc-8237-fa2e446ac1b6"), "Thực phẩm", true },
                    { new Guid("781564ee-2602-41d2-a760-500f2d8c7b86"), "Sách", true },
                    { new Guid("7ee87a89-ba0c-41e0-b1d4-f455a1596a6d"), "Thể thao", true },
                    { new Guid("87a4d44c-6675-48cf-b2ac-dbee73c2d369"), "Đồ gia dụng", true },
                    { new Guid("ebde5960-f59e-4b3e-ac2f-cecca3c964f9"), "Phụ kiện", true },
                    { new Guid("f6df1558-4679-4dfa-91e5-c2b6bb934f32"), "Đồ điện tử", true }
                });

            migrationBuilder.UpdateData(
                table: "Promotions",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "EndDate", "StartDate" },
                values: new object[] { new DateTime(2225, 9, 20, 12, 45, 12, 489, DateTimeKind.Local).AddTicks(7902), new DateTime(2025, 9, 20, 12, 45, 12, 489, DateTimeKind.Local).AddTicks(7902) });

            migrationBuilder.UpdateData(
                table: "Stores",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "CreatedAt",
                value: new DateTime(2025, 9, 20, 12, 45, 12, 489, DateTimeKind.Local).AddTicks(7896));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 20, 12, 45, 12, 489, DateTimeKind.Local).AddTicks(7452), "$2a$11$TfvuWJ58ywMBXP0u6Hy4c.muohDFRJvUK.LTc5dtRKJDneIfCPLwG", new DateTime(2025, 9, 20, 12, 45, 12, 489, DateTimeKind.Local).AddTicks(7470) });

            migrationBuilder.InsertData(
                table: "Images",
                columns: new[] { "Id", "CategoryId", "Name", "ProductDetailId", "ThumbUrl", "Url", "UserId" },
                values: new object[,]
                {
                    { "08fc8862-11c3-4436-9a01-4397f3139cc1", new Guid("77369d62-19e7-42cc-8237-fa2e446ac1b6"), "thucpham.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thucpham_la23wq", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/thucpham_la23wq.jpg", null },
                    { "1eb3bb55-cd70-41f5-8d6e-e0082c3aa0e8", new Guid("f6df1558-4679-4dfa-91e5-c2b6bb934f32"), "thu-mua-do-dien-tu-1.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/string", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314488/string.jpg", null },
                    { "20cc04da-a4a7-4253-9ec8-b35ac485f97c", new Guid("6e168ac2-f409-4106-a189-4ce100fb0c3c"), "dochoi.png", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/dochoi_rz7pys", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/dochoi_rz7pys.png", null },
                    { "2c2c3302-c9b9-4ab6-8bd8-f2a73ae5c8e6", new Guid("07d5f391-3149-400d-90dd-b010b3c88d12"), "noithat.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/noithat_steelt", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/noithat_steelt.jpg", null },
                    { "33e2b638-2c74-47d5-a2d9-890ca2d1c168", new Guid("7ee87a89-ba0c-41e0-b1d4-f455a1596a6d"), "thethao.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thethao_mv34he", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/thethao_mv34he.jpg", null },
                    { "66d727d4-971a-4e40-ae00-3943ac0987f4", new Guid("87a4d44c-6675-48cf-b2ac-dbee73c2d369"), "dogiadung.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/dogiadung_u5cuyh", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/dogiadung_u5cuyh.jpg", null },
                    { "73541469-311e-4400-a3ea-c88b90509514", new Guid("ebde5960-f59e-4b3e-ac2f-cecca3c964f9"), "phukien.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/phukien_sct8nd", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/phukien_sct8nd.jpg", null },
                    { "84eb848c-8c2b-4fb4-9683-4c7bd7a7c0fe", new Guid("577ca9d1-ad6e-42bd-91e2-5007966e6738"), "khac1.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/other", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756315891/other.jpg", null },
                    { "87d99411-7cfa-4412-a074-c7668f9cb0fb", new Guid("38afad7d-ae2c-4fc9-a1be-9d0458b141d4"), "mypham.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/mypham_iltnhv", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/mypham_iltnhv.jpg", null },
                    { "a62075a2-bdfb-4a73-ae6e-1ff4fce89327", new Guid("781564ee-2602-41d2-a760-500f2d8c7b86"), "sach.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/sach_w9rqwe", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/sach_w9rqwe.jpg", null },
                    { "b9877bf9-33ff-42f8-9759-7ebb50ae8f4d", new Guid("1aecc41f-e59f-436f-a007-51ba763111de"), "thoitrang.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thoitrang_usekdn", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/thoitrang_usekdn.jpg", null }
                });
        }
    }
}
