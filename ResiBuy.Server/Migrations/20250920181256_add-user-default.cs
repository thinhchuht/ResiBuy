using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ResiBuy.Server.Migrations
{
    /// <inheritdoc />
    public partial class adduserdefault : Migration
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
                    { new Guid("0b5e51fb-e9c5-4410-927e-f5ec2c2190af"), "Thể thao", true },
                    { new Guid("1710e3c1-bcda-4a8b-bad7-91472ea1d4bd"), "Đồ chơi", true },
                    { new Guid("2f7e2a63-b98f-42f6-88c5-0356db3a7001"), "Đồ điện tử", true },
                    { new Guid("3fce639a-2a02-4099-b207-1722fc7432fc"), "Phụ kiện", true },
                    { new Guid("4c950812-85a8-4e50-a16a-30429808ba9e"), "Thời trang", true },
                    { new Guid("54683f1c-9291-4881-8d34-d32a2e183278"), "Đồ gia dụng", true },
                    { new Guid("56fe6a3f-fcb0-4e5a-93a5-cf2b7bd6cd7a"), "Sách", true },
                    { new Guid("951eb5e0-e711-4bb5-b105-ecde8435cba6"), "Khác", true },
                    { new Guid("b1bf396a-3751-45b9-bec5-e5e543ce7563"), "Nội thất", true },
                    { new Guid("b916b4f7-5bbc-4749-952f-3aa502ebf413"), "Thực phẩm", true },
                    { new Guid("e0865a50-74f8-40b3-b62d-81ddc324fa17"), "Mỹ phẩm", true }
                });

            migrationBuilder.UpdateData(
                table: "Promotions",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "EndDate", "StartDate" },
                values: new object[] { new DateTime(2225, 9, 21, 1, 12, 54, 878, DateTimeKind.Local).AddTicks(5013), new DateTime(2025, 9, 21, 1, 12, 54, 878, DateTimeKind.Local).AddTicks(5012) });

            migrationBuilder.UpdateData(
                table: "Stores",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "CreatedAt",
                value: new DateTime(2025, 9, 21, 1, 12, 54, 878, DateTimeKind.Local).AddTicks(5008));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 21, 1, 12, 54, 878, DateTimeKind.Local).AddTicks(4672), "$2a$11$jkzsMbBUpkIxt5ydetnzR.W3XffNaYq/97EcR9sI5Dxa.7.FOUDoG", new DateTime(2025, 9, 21, 1, 12, 54, 878, DateTimeKind.Local).AddTicks(4689) });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "AvatarId", "CreatedAt", "DateOfBirth", "Email", "FullName", "IdentityNumber", "IsLocked", "PasswordHash", "PhoneNumber", "ReportCount", "Roles", "UpdatedAt" },
                values: new object[] { "55555555-5555-5555-5555-555555555555", null, new DateTime(2025, 9, 21, 1, 12, 55, 33, DateTimeKind.Local).AddTicks(217), new DateTime(2000, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "user@resibuy.local", "Khách vãng lai", "000000000000", false, "$2a$11$1Y9Ihb0GicJu1ptcqNqCJOhxGknliQjMPHFCA1JSIadeU9.aXerJm", "0123456789", 0, "[\"CUSTOMER\"]", new DateTime(2025, 9, 21, 1, 12, 55, 33, DateTimeKind.Local).AddTicks(234) });

            migrationBuilder.InsertData(
                table: "Images",
                columns: new[] { "Id", "CategoryId", "Name", "ProductDetailId", "ThumbUrl", "Url", "UserId" },
                values: new object[,]
                {
                    { "06f5ee3c-506b-48b9-a63e-9800cbc26374", new Guid("3fce639a-2a02-4099-b207-1722fc7432fc"), "phukien.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/phukien_sct8nd", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/phukien_sct8nd.jpg", null },
                    { "148ac057-6e6a-4ac8-900b-5f5f4125a63b", new Guid("b916b4f7-5bbc-4749-952f-3aa502ebf413"), "thucpham.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thucpham_la23wq", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/thucpham_la23wq.jpg", null },
                    { "32853fda-1ab8-4e4f-9e55-46f5549c45fb", new Guid("1710e3c1-bcda-4a8b-bad7-91472ea1d4bd"), "dochoi.png", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/dochoi_rz7pys", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/dochoi_rz7pys.png", null },
                    { "462f3688-9988-4a3b-9729-5b43a30fd96d", new Guid("56fe6a3f-fcb0-4e5a-93a5-cf2b7bd6cd7a"), "sach.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/sach_w9rqwe", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/sach_w9rqwe.jpg", null },
                    { "87e2e581-1ebf-4e4a-a38b-0a955aabc758", new Guid("2f7e2a63-b98f-42f6-88c5-0356db3a7001"), "thu-mua-do-dien-tu-1.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/string", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314488/string.jpg", null },
                    { "89984d4c-fe67-4a33-9379-ba09fe3ac6d8", new Guid("e0865a50-74f8-40b3-b62d-81ddc324fa17"), "mypham.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/mypham_iltnhv", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/mypham_iltnhv.jpg", null },
                    { "a1dec1e9-fea4-436e-852a-e262d12e62b7", new Guid("b1bf396a-3751-45b9-bec5-e5e543ce7563"), "noithat.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/noithat_steelt", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/noithat_steelt.jpg", null },
                    { "bec3af53-865d-4821-a9b0-1c3f52ee5536", new Guid("0b5e51fb-e9c5-4410-927e-f5ec2c2190af"), "thethao.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thethao_mv34he", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/thethao_mv34he.jpg", null },
                    { "d7fb4c2c-da86-40cb-8a6d-7c4b38bb8f60", new Guid("4c950812-85a8-4e50-a16a-30429808ba9e"), "thoitrang.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thoitrang_usekdn", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/thoitrang_usekdn.jpg", null },
                    { "eb3d68d6-0bef-4695-9841-5afb555bbd36", new Guid("951eb5e0-e711-4bb5-b105-ecde8435cba6"), "khac1.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/other", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756315891/other.jpg", null },
                    { "ed5ee8e1-ede1-4703-b0a0-7b13a979a134", new Guid("54683f1c-9291-4881-8d34-d32a2e183278"), "dogiadung.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/dogiadung_u5cuyh", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/dogiadung_u5cuyh.jpg", null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "06f5ee3c-506b-48b9-a63e-9800cbc26374");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "148ac057-6e6a-4ac8-900b-5f5f4125a63b");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "32853fda-1ab8-4e4f-9e55-46f5549c45fb");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "462f3688-9988-4a3b-9729-5b43a30fd96d");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "87e2e581-1ebf-4e4a-a38b-0a955aabc758");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "89984d4c-fe67-4a33-9379-ba09fe3ac6d8");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "a1dec1e9-fea4-436e-852a-e262d12e62b7");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "bec3af53-865d-4821-a9b0-1c3f52ee5536");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "d7fb4c2c-da86-40cb-8a6d-7c4b38bb8f60");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "eb3d68d6-0bef-4695-9841-5afb555bbd36");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "ed5ee8e1-ede1-4703-b0a0-7b13a979a134");

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "55555555-5555-5555-5555-555555555555");

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("0b5e51fb-e9c5-4410-927e-f5ec2c2190af"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("1710e3c1-bcda-4a8b-bad7-91472ea1d4bd"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("2f7e2a63-b98f-42f6-88c5-0356db3a7001"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("3fce639a-2a02-4099-b207-1722fc7432fc"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("4c950812-85a8-4e50-a16a-30429808ba9e"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("54683f1c-9291-4881-8d34-d32a2e183278"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("56fe6a3f-fcb0-4e5a-93a5-cf2b7bd6cd7a"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("951eb5e0-e711-4bb5-b105-ecde8435cba6"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("b1bf396a-3751-45b9-bec5-e5e543ce7563"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("b916b4f7-5bbc-4749-952f-3aa502ebf413"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("e0865a50-74f8-40b3-b62d-81ddc324fa17"));

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
