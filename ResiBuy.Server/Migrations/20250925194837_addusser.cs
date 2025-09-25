using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ResiBuy.Server.Migrations
{
    /// <inheritdoc />
    public partial class addusser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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
                    { new Guid("199504c4-753a-46f0-90ab-a8828c4f65f1"), "Nội thất", true },
                    { new Guid("1ee5ca27-1090-4fc5-8bde-862a3ee7e41f"), "Phụ kiện", true },
                    { new Guid("30dfb37b-0f66-42a4-a857-e21ddf58aae5"), "Đồ chơi", true },
                    { new Guid("3ed7536f-9da9-4986-a7f9-0b3e55ad2bb6"), "Thực phẩm", true },
                    { new Guid("44a2bf24-025e-4725-8a6e-ada61af9c89c"), "Đồ gia dụng", true },
                    { new Guid("796476c6-7f71-417d-8ba8-56fb440ec816"), "Thể thao", true },
                    { new Guid("7e699641-25f7-4f91-baf3-a1f3bbb2de18"), "Sách", true },
                    { new Guid("90e93d14-c9ba-4985-b31e-2fbe3255d40b"), "Thời trang", true },
                    { new Guid("ad4ceb6a-dfbd-4465-bbf8-f118243fffe7"), "Khác", true },
                    { new Guid("bcd09212-acd8-48ec-ae83-04302e4c04b1"), "Đồ điện tử", true },
                    { new Guid("dbc8b8cd-3664-4c52-a35b-33d3748403b5"), "Mỹ phẩm", true }
                });

            migrationBuilder.UpdateData(
                table: "Promotions",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "EndDate", "IsActive", "StartDate" },
                values: new object[] { new DateTime(2225, 9, 26, 2, 48, 34, 491, DateTimeKind.Local).AddTicks(7403), true, new DateTime(2025, 9, 26, 2, 48, 34, 491, DateTimeKind.Local).AddTicks(7403) });

            migrationBuilder.UpdateData(
                table: "Stores",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "CreatedAt",
                value: new DateTime(2025, 9, 26, 2, 48, 34, 491, DateTimeKind.Local).AddTicks(7395));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "55555555-5555-5555-5555-555555555555",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 26, 2, 48, 34, 616, DateTimeKind.Local).AddTicks(8316), "$2a$11$4C2QJkFmLeSW.Satg772KubF6zb4gVyz92EXREBTlJNQSYRBI4P5C", new DateTime(2025, 9, 26, 2, 48, 34, 616, DateTimeKind.Local).AddTicks(8332) });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "Roles", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 26, 2, 48, 34, 491, DateTimeKind.Local).AddTicks(6945), "$2a$11$lxmx/T1dwkb12.jZ9Tk4OOTVHcBIYK8Z42VZQG9bHiSXqF7veDwPm", "[\"ADMIN\",\"SELLER\"]", new DateTime(2025, 9, 26, 2, 48, 34, 491, DateTimeKind.Local).AddTicks(6959) });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "AvatarId", "CreatedAt", "DateOfBirth", "Email", "FullName", "IdentityNumber", "IsLocked", "PasswordHash", "PhoneNumber", "ReportCount", "Roles", "UpdatedAt" },
                values: new object[] { "55555555-5555-5555-5555-555555555556", null, new DateTime(2025, 9, 26, 2, 48, 34, 740, DateTimeKind.Local).AddTicks(3302), new DateTime(2000, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "user@resibuy.staff", "Nhân viên cửa hàng", "000000000001", false, "$2a$11$55ZuElz062squapFz8AFCuGwxwYGoCBnNPK.yVcK62QSQDShBphLu", "0123456788", 0, "[\"SELLER\"]", new DateTime(2025, 9, 26, 2, 48, 34, 740, DateTimeKind.Local).AddTicks(3314) });

            migrationBuilder.InsertData(
                table: "Images",
                columns: new[] { "Id", "CategoryId", "Name", "ProductDetailId", "ThumbUrl", "Url", "UserId" },
                values: new object[,]
                {
                    { "27feb2df-74e6-47d0-9e46-9d310f3ca390", new Guid("30dfb37b-0f66-42a4-a857-e21ddf58aae5"), "dochoi.png", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/dochoi_rz7pys", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/dochoi_rz7pys.png", null },
                    { "2dacae6c-d356-49c7-be0d-fce8ea6f5080", new Guid("90e93d14-c9ba-4985-b31e-2fbe3255d40b"), "thoitrang.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thoitrang_usekdn", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/thoitrang_usekdn.jpg", null },
                    { "2e3ec812-5b82-4fdb-b30b-a8fe8a10178c", new Guid("7e699641-25f7-4f91-baf3-a1f3bbb2de18"), "sach.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/sach_w9rqwe", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/sach_w9rqwe.jpg", null },
                    { "3b5da33e-f1af-46cc-b421-64b265abbbe7", new Guid("44a2bf24-025e-4725-8a6e-ada61af9c89c"), "dogiadung.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/dogiadung_u5cuyh", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/dogiadung_u5cuyh.jpg", null },
                    { "468bb9d9-7bb3-46d5-8513-032c81d299ae", new Guid("3ed7536f-9da9-4986-a7f9-0b3e55ad2bb6"), "thucpham.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thucpham_la23wq", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/thucpham_la23wq.jpg", null },
                    { "57b9fd07-fde2-42ff-8a64-e3dcc301db8d", new Guid("796476c6-7f71-417d-8ba8-56fb440ec816"), "thethao.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thethao_mv34he", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/thethao_mv34he.jpg", null },
                    { "862878c0-307f-4bfb-a464-5431ad97cb7e", new Guid("1ee5ca27-1090-4fc5-8bde-862a3ee7e41f"), "phukien.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/phukien_sct8nd", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/phukien_sct8nd.jpg", null },
                    { "a39139ce-bb95-407a-9171-2e470693d3dc", new Guid("dbc8b8cd-3664-4c52-a35b-33d3748403b5"), "mypham.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/mypham_iltnhv", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/mypham_iltnhv.jpg", null },
                    { "c7f98811-6f8f-49bb-8033-85d461a5f606", new Guid("bcd09212-acd8-48ec-ae83-04302e4c04b1"), "thu-mua-do-dien-tu-1.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/string", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314488/string.jpg", null },
                    { "f38e21dc-2fd7-44ac-a411-8137b4618a8d", new Guid("ad4ceb6a-dfbd-4465-bbf8-f118243fffe7"), "khac1.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/other", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756315891/other.jpg", null },
                    { "f8963a95-b67f-4b90-8df6-939df1122761", new Guid("199504c4-753a-46f0-90ab-a8828c4f65f1"), "noithat.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/noithat_steelt", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/noithat_steelt.jpg", null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "27feb2df-74e6-47d0-9e46-9d310f3ca390");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "2dacae6c-d356-49c7-be0d-fce8ea6f5080");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "2e3ec812-5b82-4fdb-b30b-a8fe8a10178c");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "3b5da33e-f1af-46cc-b421-64b265abbbe7");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "468bb9d9-7bb3-46d5-8513-032c81d299ae");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "57b9fd07-fde2-42ff-8a64-e3dcc301db8d");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "862878c0-307f-4bfb-a464-5431ad97cb7e");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "a39139ce-bb95-407a-9171-2e470693d3dc");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "c7f98811-6f8f-49bb-8033-85d461a5f606");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "f38e21dc-2fd7-44ac-a411-8137b4618a8d");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "f8963a95-b67f-4b90-8df6-939df1122761");

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "55555555-5555-5555-5555-555555555556");

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("199504c4-753a-46f0-90ab-a8828c4f65f1"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("1ee5ca27-1090-4fc5-8bde-862a3ee7e41f"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("30dfb37b-0f66-42a4-a857-e21ddf58aae5"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("3ed7536f-9da9-4986-a7f9-0b3e55ad2bb6"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("44a2bf24-025e-4725-8a6e-ada61af9c89c"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("796476c6-7f71-417d-8ba8-56fb440ec816"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("7e699641-25f7-4f91-baf3-a1f3bbb2de18"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("90e93d14-c9ba-4985-b31e-2fbe3255d40b"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("ad4ceb6a-dfbd-4465-bbf8-f118243fffe7"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("bcd09212-acd8-48ec-ae83-04302e4c04b1"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("dbc8b8cd-3664-4c52-a35b-33d3748403b5"));

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
                columns: new[] { "EndDate", "IsActive", "StartDate" },
                values: new object[] { new DateTime(2225, 9, 21, 1, 12, 54, 878, DateTimeKind.Local).AddTicks(5013), false, new DateTime(2025, 9, 21, 1, 12, 54, 878, DateTimeKind.Local).AddTicks(5012) });

            migrationBuilder.UpdateData(
                table: "Stores",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "CreatedAt",
                value: new DateTime(2025, 9, 21, 1, 12, 54, 878, DateTimeKind.Local).AddTicks(5008));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "55555555-5555-5555-5555-555555555555",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 21, 1, 12, 55, 33, DateTimeKind.Local).AddTicks(217), "$2a$11$1Y9Ihb0GicJu1ptcqNqCJOhxGknliQjMPHFCA1JSIadeU9.aXerJm", new DateTime(2025, 9, 21, 1, 12, 55, 33, DateTimeKind.Local).AddTicks(234) });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "Roles", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 21, 1, 12, 54, 878, DateTimeKind.Local).AddTicks(4672), "$2a$11$jkzsMbBUpkIxt5ydetnzR.W3XffNaYq/97EcR9sI5Dxa.7.FOUDoG", "[\"ADMIN\"]", new DateTime(2025, 9, 21, 1, 12, 54, 878, DateTimeKind.Local).AddTicks(4689) });

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
    }
}
