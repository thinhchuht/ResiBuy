using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ResiBuy.Server.Migrations
{
    /// <inheritdoc />
    public partial class p : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_Categories_CategoryId",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_Promotions_PromotionId",
                table: "Products");

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

            migrationBuilder.AlterColumn<DateTime>(
                name: "DateOfBirth",
                table: "Users",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<Guid>(
                name: "ShippingAddressId",
                table: "Orders",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<int>(
                name: "OrderType",
                table: "Orders",
                type: "int",
                nullable: true);

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Name", "Status" },
                values: new object[,]
                {
                    { new Guid("04f5fc72-2106-4e5f-98ee-60ba1d7d932a"), "Nội thất", true },
                    { new Guid("1f5749ad-6ebf-4045-b4cb-1a0f8be26205"), "Đồ chơi", true },
                    { new Guid("210ecab1-2bfb-4a08-8c83-77f829e63ea3"), "Sách", true },
                    { new Guid("5fe62da6-e285-4ba3-93b5-11a87dca2586"), "Mỹ phẩm", true },
                    { new Guid("7f95d7b8-e7f1-4ab6-9b2d-8692005a65f0"), "Đồ gia dụng", true },
                    { new Guid("91939c5b-aa20-4507-ae42-d21c20ff7dad"), "Thể thao", true },
                    { new Guid("ba8ee5f1-9e83-4ef0-8f51-67ee04d5062b"), "Thực phẩm", true },
                    { new Guid("defc03f6-f114-4fcf-a319-77adb6593ebe"), "Phụ kiện", true },
                    { new Guid("f65964f7-147f-4ec8-934f-59d48516467c"), "Khác", true },
                    { new Guid("f8cf0441-34ea-44d9-be02-9b916c0add65"), "Đồ điện tử", true },
                    { new Guid("f9a4ef9f-78d8-4722-8335-47c9753f6534"), "Thời trang", true }
                });

            migrationBuilder.UpdateData(
                table: "Promotions",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "EndDate", "StartDate" },
                values: new object[] { new DateTime(2225, 9, 19, 17, 36, 47, 91, DateTimeKind.Local).AddTicks(788), new DateTime(2025, 9, 19, 17, 36, 47, 91, DateTimeKind.Local).AddTicks(788) });

            migrationBuilder.UpdateData(
                table: "Stores",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "CreatedAt",
                value: new DateTime(2025, 9, 19, 17, 36, 47, 91, DateTimeKind.Local).AddTicks(782));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 19, 17, 36, 46, 967, DateTimeKind.Local).AddTicks(2095), "$2a$11$vehby1YaFBwIrjQg7NNli.OaOvVurxzYvBVsy4AujBFccg34fzqP2", new DateTime(2025, 9, 19, 17, 36, 46, 967, DateTimeKind.Local).AddTicks(2109) });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "AvatarId", "CreatedAt", "DateOfBirth", "Email", "FullName", "IdentityNumber", "IsLocked", "PasswordHash", "PhoneNumber", "ReportCount", "Roles", "UpdatedAt" },
                values: new object[] { "0774b5b3-3705-453a-92ca-08c632ed41fa", null, new DateTime(2025, 9, 19, 17, 36, 47, 91, DateTimeKind.Local).AddTicks(271), new DateTime(2000, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Khách vãng lai", null, false, "$2a$11$dOfZRZcu6OG6TtOwXniNy.gJ5pbuAecaVQJ6Vlydk8pnKh2qCiCB2", "0", 0, "[\"CUSTOMER\"]", new DateTime(2025, 9, 19, 17, 36, 47, 91, DateTimeKind.Local).AddTicks(286) });

            migrationBuilder.InsertData(
                table: "Images",
                columns: new[] { "Id", "CategoryId", "Name", "ProductDetailId", "ThumbUrl", "Url", "UserId" },
                values: new object[,]
                {
                    { "27250f24-7b70-4487-849c-58e3be51c732", new Guid("f65964f7-147f-4ec8-934f-59d48516467c"), "khac1.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/other", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756315891/other.jpg", null },
                    { "33acdbde-a7d6-4b3d-97ad-37f04d7678e8", new Guid("91939c5b-aa20-4507-ae42-d21c20ff7dad"), "thethao.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thethao_mv34he", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/thethao_mv34he.jpg", null },
                    { "3532fc4d-dd75-4d30-a762-59e59d6058c1", new Guid("210ecab1-2bfb-4a08-8c83-77f829e63ea3"), "sach.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/sach_w9rqwe", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/sach_w9rqwe.jpg", null },
                    { "3dd6074a-a0a1-4418-81b3-0c3c597171bd", new Guid("7f95d7b8-e7f1-4ab6-9b2d-8692005a65f0"), "dogiadung.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/dogiadung_u5cuyh", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/dogiadung_u5cuyh.jpg", null },
                    { "9ccfdcce-911d-46c8-a016-37f0c89a2167", new Guid("defc03f6-f114-4fcf-a319-77adb6593ebe"), "phukien.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/phukien_sct8nd", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/phukien_sct8nd.jpg", null },
                    { "9d8770b1-f2c6-40ae-8460-fa7474f089e8", new Guid("1f5749ad-6ebf-4045-b4cb-1a0f8be26205"), "dochoi.png", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/dochoi_rz7pys", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/dochoi_rz7pys.png", null },
                    { "9ec3ba9e-2bc3-46ed-aa8a-cca3440f01c4", new Guid("04f5fc72-2106-4e5f-98ee-60ba1d7d932a"), "noithat.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/noithat_steelt", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/noithat_steelt.jpg", null },
                    { "be289316-910c-406e-820a-eab462fa4a57", new Guid("f8cf0441-34ea-44d9-be02-9b916c0add65"), "thu-mua-do-dien-tu-1.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/string", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314488/string.jpg", null },
                    { "d24cdfbf-bd11-4f86-bab7-7ede7d933b3e", new Guid("ba8ee5f1-9e83-4ef0-8f51-67ee04d5062b"), "thucpham.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thucpham_la23wq", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/thucpham_la23wq.jpg", null },
                    { "e51d29fc-1c14-4b11-84f0-bdab6cad461c", new Guid("f9a4ef9f-78d8-4722-8335-47c9753f6534"), "thoitrang.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thoitrang_usekdn", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/thoitrang_usekdn.jpg", null },
                    { "e5da5f6f-d0fe-4641-bd19-a70c5cfd73fe", new Guid("5fe62da6-e285-4ba3-93b5-11a87dca2586"), "mypham.jpg", null, "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/mypham_iltnhv", "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/mypham_iltnhv.jpg", null }
                });

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Categories_CategoryId",
                table: "Products",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Promotions_PromotionId",
                table: "Products",
                column: "PromotionId",
                principalTable: "Promotions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_Categories_CategoryId",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_Promotions_PromotionId",
                table: "Products");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "27250f24-7b70-4487-849c-58e3be51c732");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "33acdbde-a7d6-4b3d-97ad-37f04d7678e8");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "3532fc4d-dd75-4d30-a762-59e59d6058c1");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "3dd6074a-a0a1-4418-81b3-0c3c597171bd");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "9ccfdcce-911d-46c8-a016-37f0c89a2167");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "9d8770b1-f2c6-40ae-8460-fa7474f089e8");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "9ec3ba9e-2bc3-46ed-aa8a-cca3440f01c4");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "be289316-910c-406e-820a-eab462fa4a57");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "d24cdfbf-bd11-4f86-bab7-7ede7d933b3e");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "e51d29fc-1c14-4b11-84f0-bdab6cad461c");

            migrationBuilder.DeleteData(
                table: "Images",
                keyColumn: "Id",
                keyValue: "e5da5f6f-d0fe-4641-bd19-a70c5cfd73fe");

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "0774b5b3-3705-453a-92ca-08c632ed41fa");

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("04f5fc72-2106-4e5f-98ee-60ba1d7d932a"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("1f5749ad-6ebf-4045-b4cb-1a0f8be26205"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("210ecab1-2bfb-4a08-8c83-77f829e63ea3"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("5fe62da6-e285-4ba3-93b5-11a87dca2586"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("7f95d7b8-e7f1-4ab6-9b2d-8692005a65f0"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("91939c5b-aa20-4507-ae42-d21c20ff7dad"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("ba8ee5f1-9e83-4ef0-8f51-67ee04d5062b"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("defc03f6-f114-4fcf-a319-77adb6593ebe"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("f65964f7-147f-4ec8-934f-59d48516467c"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("f8cf0441-34ea-44d9-be02-9b916c0add65"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("f9a4ef9f-78d8-4722-8335-47c9753f6534"));

            migrationBuilder.DropColumn(
                name: "OrderType",
                table: "Orders");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DateOfBirth",
                table: "Users",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "ShippingAddressId",
                table: "Orders",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

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

            migrationBuilder.UpdateData(
                table: "Promotions",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "EndDate", "StartDate" },
                values: new object[] { new DateTime(2225, 9, 17, 21, 43, 30, 374, DateTimeKind.Local).AddTicks(8412), new DateTime(2025, 9, 17, 21, 43, 30, 374, DateTimeKind.Local).AddTicks(8411) });

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

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Categories_CategoryId",
                table: "Products",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Promotions_PromotionId",
                table: "Products",
                column: "PromotionId",
                principalTable: "Promotions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
