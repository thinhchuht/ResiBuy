using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ResiBuy.Server.Migrations
{
    /// <inheritdoc />
    public partial class addseedcategory_01 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "06ae626a-0899-4a38-8f1b-0316202c4428");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "075fef74-e60e-4d68-bb60-0997995a9d7d");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "10cdbee3-051f-423f-961d-0e6dc9f633c5");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "17acb302-b70d-46d9-a21f-3b271be51c41");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "822f7d86-6f31-4a79-935d-c71ecad5a7bf");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "ace0984c-16bd-4a83-9a89-81e425c13907");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "c647fe00-90fb-4ab2-a138-67b16b5bd17f");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "c7c992e6-5806-4b54-8a57-59c5b438250b");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "cf09859b-6c6c-4816-9811-f459bb813e42");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "e7cb6354-bbc9-48b1-b7f0-11c790d8211d");

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("2f111d52-30fb-473c-a6e0-0d14ae3928f3"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("30afab43-160b-4404-8a9a-ed2b687f8e33"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("4a653656-4a7d-4393-91b1-7e69b1d598b9"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("68d0ac89-16d1-4ba2-b471-503443a0fe48"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("7828cd00-8dce-4a7c-a383-7e32a067a994"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("7c67c125-3ef2-4ab3-bc83-f635e0f6b3f4"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("90c5e2bc-6f86-4666-a5fd-24f4199feee2"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("a451ae9f-7b8f-4afe-acbf-7b48dfa4b0e0"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("aca25380-74c9-42f3-b970-196adc95d927"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("dfbb8122-75e1-416f-bfec-1d86f584acc4"));

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Name", "Status" },
                values: new object[,]
                {
                    { new Guid("125bfa69-e42a-4a0f-8726-7e9a27d6e31b"), "Thể thao", true },
                    { new Guid("2a161117-bb5d-464a-b616-ae887e54e483"), "Khác", true },
                    { new Guid("4556d7c0-3524-43a3-a9c3-0276f649fd33"), "Mỹ phẩm", true },
                    { new Guid("729bf691-29fe-4fd6-a63a-162386d48b8b"), "Đồ gia dụng", true },
                    { new Guid("7c50b56a-ad3b-486e-ae19-7dcc623dd486"), "Đồ chơi", true },
                    { new Guid("81799016-7be9-4f75-a21b-6871e55435e1"), "Sách", true },
                    { new Guid("bb4d2219-fd9e-4afb-a70a-208741f1b3f2"), "Nội thất", true },
                    { new Guid("c9b22285-6c42-4092-89af-dfeef9bc9c4e"), "Đồ điện tử", true },
                    { new Guid("dd262c2d-9354-4386-9089-d813a1ee4121"), "Thực phẩm", true },
                    { new Guid("ee5f681a-11fe-4589-bb7b-82d955085c45"), "Thời trang", true },
                    { new Guid("f88f0e98-f4d4-46b5-a069-1733b31ae8a9"), "Phụ kiện", true }
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 28, 0, 33, 1, 487, DateTimeKind.Local).AddTicks(8977), "$2a$11$Momsb6Ng/llGjgR6nrkxeeMGe1hi.a/xfMPTuMom52kDkaI7degue", new DateTime(2025, 8, 28, 0, 33, 1, 487, DateTimeKind.Local).AddTicks(9077) });

            migrationBuilder.InsertData(
                table: "Images",
                columns: new[] { "Id", "CategoryId", "Name", "ProductDetailId", "ThumbUrl", "Url", "UserId" },
                values: new object[,]
                {
                    { "0f516356-03a3-49bd-932b-1056faa978f5", new Guid("2a161117-bb5d-464a-b616-ae887e54e483"), "khac1.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/other", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756315891/other.jpg", null },
                    { "18003ded-5b70-4241-8de0-91c6a3e57a72", new Guid("729bf691-29fe-4fd6-a63a-162386d48b8b"), "dogiadung.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/dogiadung_u5cuyh", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/dogiadung_u5cuyh.jpg", null },
                    { "5584e6b3-c84b-4601-abf9-e9ffe45db5ba", new Guid("125bfa69-e42a-4a0f-8726-7e9a27d6e31b"), "thethao.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thethao_mv34he", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/thethao_mv34he.jpg", null },
                    { "566b0849-18af-4289-9d76-bc938db11545", new Guid("ee5f681a-11fe-4589-bb7b-82d955085c45"), "thoitrang.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thoitrang_usekdn", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/thoitrang_usekdn.jpg", null },
                    { "83795a0a-c702-4c85-af9b-409e02ea0dc8", new Guid("bb4d2219-fd9e-4afb-a70a-208741f1b3f2"), "noithat.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/noithat_steelt", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/noithat_steelt.jpg", null },
                    { "b3d4fa32-6013-4b97-b338-ef3a5eca71f2", new Guid("81799016-7be9-4f75-a21b-6871e55435e1"), "sach.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/sach_w9rqwe", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/sach_w9rqwe.jpg", null },
                    { "b88a2158-2472-45a4-8234-1fdf84f42763", new Guid("c9b22285-6c42-4092-89af-dfeef9bc9c4e"), "thu-mua-do-dien-tu-1.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/string", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314488/string.jpg", null },
                    { "c684483c-c193-4d58-9100-9e7afbf3ac2b", new Guid("7c50b56a-ad3b-486e-ae19-7dcc623dd486"), "dochoi.png", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/dochoi_rz7pys", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/dochoi_rz7pys.png", null },
                    { "ebde9144-f95a-42a2-b060-f15bfa0f08fd", new Guid("f88f0e98-f4d4-46b5-a069-1733b31ae8a9"), "phukien.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/phukien_sct8nd", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/phukien_sct8nd.jpg", null },
                    { "eea36c66-1f61-4264-9967-7a99b700d79e", new Guid("4556d7c0-3524-43a3-a9c3-0276f649fd33"), "mypham.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/mypham_iltnhv", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/mypham_iltnhv.jpg", null },
                    { "f8199e61-67e6-4d67-8582-01ab7c99fdae", new Guid("dd262c2d-9354-4386-9089-d813a1ee4121"), "thucpham.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thucpham_la23wq", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/thucpham_la23wq.jpg", null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "0f516356-03a3-49bd-932b-1056faa978f5");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "18003ded-5b70-4241-8de0-91c6a3e57a72");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "5584e6b3-c84b-4601-abf9-e9ffe45db5ba");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "566b0849-18af-4289-9d76-bc938db11545");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "83795a0a-c702-4c85-af9b-409e02ea0dc8");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "b3d4fa32-6013-4b97-b338-ef3a5eca71f2");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "b88a2158-2472-45a4-8234-1fdf84f42763");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "c684483c-c193-4d58-9100-9e7afbf3ac2b");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "ebde9144-f95a-42a2-b060-f15bfa0f08fd");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "eea36c66-1f61-4264-9967-7a99b700d79e");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "f8199e61-67e6-4d67-8582-01ab7c99fdae");

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("125bfa69-e42a-4a0f-8726-7e9a27d6e31b"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("2a161117-bb5d-464a-b616-ae887e54e483"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("4556d7c0-3524-43a3-a9c3-0276f649fd33"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("729bf691-29fe-4fd6-a63a-162386d48b8b"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("7c50b56a-ad3b-486e-ae19-7dcc623dd486"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("81799016-7be9-4f75-a21b-6871e55435e1"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("bb4d2219-fd9e-4afb-a70a-208741f1b3f2"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("c9b22285-6c42-4092-89af-dfeef9bc9c4e"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("dd262c2d-9354-4386-9089-d813a1ee4121"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("ee5f681a-11fe-4589-bb7b-82d955085c45"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("f88f0e98-f4d4-46b5-a069-1733b31ae8a9"));

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Name", "Status" },
                values: new object[,]
                {
                    { new Guid("2f111d52-30fb-473c-a6e0-0d14ae3928f3"), "Đồ chơi", true },
                    { new Guid("30afab43-160b-4404-8a9a-ed2b687f8e33"), "Thời trang", true },
                    { new Guid("4a653656-4a7d-4393-91b1-7e69b1d598b9"), "Thể thao", true },
                    { new Guid("68d0ac89-16d1-4ba2-b471-503443a0fe48"), "Nội thất", true },
                    { new Guid("7828cd00-8dce-4a7c-a383-7e32a067a994"), "Phụ kiện", true },
                    { new Guid("7c67c125-3ef2-4ab3-bc83-f635e0f6b3f4"), "Đồ điện tử", true },
                    { new Guid("90c5e2bc-6f86-4666-a5fd-24f4199feee2"), "Đồ gia dụng", true },
                    { new Guid("a451ae9f-7b8f-4afe-acbf-7b48dfa4b0e0"), "Mỹ phẩm", true },
                    { new Guid("aca25380-74c9-42f3-b970-196adc95d927"), "Sách", true },
                    { new Guid("dfbb8122-75e1-416f-bfec-1d86f584acc4"), "Thực phẩm", true }
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 28, 0, 22, 23, 664, DateTimeKind.Local).AddTicks(2783), "$2a$11$7jEfnrteiybasZx5dL2TKewuqpvOEVHCokVP2mQ2eV6M9IWoMkmyK", new DateTime(2025, 8, 28, 0, 22, 23, 664, DateTimeKind.Local).AddTicks(2797) });

            migrationBuilder.InsertData(
                table: "Images",
                columns: new[] { "Id", "CategoryId", "Name", "ProductDetailId", "ThumbUrl", "Url", "UserId" },
                values: new object[,]
                {
                    { "06ae626a-0899-4a38-8f1b-0316202c4428", new Guid("7828cd00-8dce-4a7c-a383-7e32a067a994"), "phukien.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/phukien_sct8nd", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/phukien_sct8nd.jpg", null },
                    { "075fef74-e60e-4d68-bb60-0997995a9d7d", new Guid("a451ae9f-7b8f-4afe-acbf-7b48dfa4b0e0"), "mypham.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/mypham_iltnhv", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/mypham_iltnhv.jpg", null },
                    { "10cdbee3-051f-423f-961d-0e6dc9f633c5", new Guid("30afab43-160b-4404-8a9a-ed2b687f8e33"), "thoitrang.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thoitrang_usekdn", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/thoitrang_usekdn.jpg", null },
                    { "17acb302-b70d-46d9-a21f-3b271be51c41", new Guid("4a653656-4a7d-4393-91b1-7e69b1d598b9"), "thethao.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thethao_mv34he", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/thethao_mv34he.jpg", null },
                    { "822f7d86-6f31-4a79-935d-c71ecad5a7bf", new Guid("dfbb8122-75e1-416f-bfec-1d86f584acc4"), "thucpham.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thucpham_la23wq", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/thucpham_la23wq.jpg", null },
                    { "ace0984c-16bd-4a83-9a89-81e425c13907", new Guid("aca25380-74c9-42f3-b970-196adc95d927"), "sach.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/sach_w9rqwe", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/sach_w9rqwe.jpg", null },
                    { "c647fe00-90fb-4ab2-a138-67b16b5bd17f", new Guid("2f111d52-30fb-473c-a6e0-0d14ae3928f3"), "dochoi.png", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/dochoi_rz7pys", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/dochoi_rz7pys.png", null },
                    { "c7c992e6-5806-4b54-8a57-59c5b438250b", new Guid("68d0ac89-16d1-4ba2-b471-503443a0fe48"), "noithat.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/noithat_steelt", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/noithat_steelt.jpg", null },
                    { "cf09859b-6c6c-4816-9811-f459bb813e42", new Guid("7c67c125-3ef2-4ab3-bc83-f635e0f6b3f4"), "thu-mua-do-dien-tu-1.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/string", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314488/string.jpg", null },
                    { "e7cb6354-bbc9-48b1-b7f0-11c790d8211d", new Guid("90c5e2bc-6f86-4666-a5fd-24f4199feee2"), "dogiadung.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/dogiadung_u5cuyh", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/dogiadung_u5cuyh.jpg", null }
                });
        }
    }
}
