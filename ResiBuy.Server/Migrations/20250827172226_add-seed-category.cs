using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ResiBuy.Server.Migrations
{
    /// <inheritdoc />
    public partial class addseedcategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 11, 14, 24, 42, 81, DateTimeKind.Local).AddTicks(651), "$2a$11$KYoW.o7GsPRHDVNMmwk/ZOVVh9LMYHNsJFulMnsh9JL.a8oX.0w8m", new DateTime(2025, 8, 11, 14, 24, 42, 81, DateTimeKind.Local).AddTicks(666) });
        }
    }
}
