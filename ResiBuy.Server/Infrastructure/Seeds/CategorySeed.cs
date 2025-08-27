namespace ResiBuy.Server.Infrastructure.Seeds
{
    public static class CategorySeed
    {
        public static void Seed(ModelBuilder modelBuilder)
        {
            // Define fixed GUIDs for each category to ensure referential integrity
            var electronicsCategoryId = Guid.NewGuid();
            var fashionCategoryId = Guid.NewGuid();
            var householdCategoryId = Guid.NewGuid();
            var bookCategoryId = Guid.NewGuid();
            var sportCategoryId = Guid.NewGuid();
            var cosmeticCategoryId = Guid.NewGuid();
            var toyCategoryId = Guid.NewGuid();
            var foodCategoryId = Guid.NewGuid();
            var accessoryCategoryId = Guid.NewGuid();
            var furnitureCategoryId = Guid.NewGuid();
            var otherCategoryId = Guid.NewGuid();

            modelBuilder.Entity<Category>().HasData(
                new Category { Id = electronicsCategoryId, Name = "Đồ điện tử", Status = true },
                new Category { Id = fashionCategoryId, Name = "Thời trang", Status = true },
                new Category { Id = householdCategoryId, Name = "Đồ gia dụng", Status = true },
                new Category { Id = bookCategoryId, Name = "Sách", Status = true },
                new Category { Id = sportCategoryId, Name = "Thể thao", Status = true },
                new Category { Id = cosmeticCategoryId, Name = "Mỹ phẩm", Status = true },
                new Category { Id = toyCategoryId, Name = "Đồ chơi", Status = true },
                new Category { Id = foodCategoryId, Name = "Thực phẩm", Status = true },
                new Category { Id = accessoryCategoryId, Name = "Phụ kiện", Status = true },
                new Category { Id = furnitureCategoryId, Name = "Nội thất", Status = true },
                 new Category { Id = otherCategoryId, Name = "Khác", Status = true }
            );

            // Seed Image cho từng Category
            modelBuilder.Entity<Image>().HasData(
                new Image { Id = Guid.NewGuid().ToString(), Url = "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314488/string.jpg", ThumbUrl = "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/string", Name = "thu-mua-do-dien-tu-1.jpg", CategoryId = electronicsCategoryId },
                new Image { Id = Guid.NewGuid().ToString(), Url = "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/thoitrang_usekdn.jpg", ThumbUrl = "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thoitrang_usekdn", Name = "thoitrang.jpg", CategoryId = fashionCategoryId },
                new Image { Id = Guid.NewGuid().ToString(), Url = "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/dogiadung_u5cuyh.jpg", ThumbUrl = "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/dogiadung_u5cuyh", Name = "dogiadung.jpg", CategoryId = householdCategoryId },
                new Image { Id = Guid.NewGuid().ToString(), Url = "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/sach_w9rqwe.jpg", ThumbUrl = "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/sach_w9rqwe", Name = "sach.jpg", CategoryId = bookCategoryId },
                new Image { Id = Guid.NewGuid().ToString(), Url = "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/thethao_mv34he.jpg", ThumbUrl = "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thethao_mv34he", Name = "thethao.jpg", CategoryId = sportCategoryId },
                new Image { Id = Guid.NewGuid().ToString(), Url = "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/mypham_iltnhv.jpg", ThumbUrl = "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/mypham_iltnhv", Name = "mypham.jpg", CategoryId = cosmeticCategoryId },
                new Image { Id = Guid.NewGuid().ToString(), Url = "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/dochoi_rz7pys.png", ThumbUrl = "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/dochoi_rz7pys", Name = "dochoi.png", CategoryId = toyCategoryId },
                new Image { Id = Guid.NewGuid().ToString(), Url = "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314611/resibuy/thucpham_la23wq.jpg", ThumbUrl = "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/thucpham_la23wq", Name = "thucpham.jpg", CategoryId = foodCategoryId },
                new Image { Id = Guid.NewGuid().ToString(), Url = "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/phukien_sct8nd.jpg", ThumbUrl = "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/phukien_sct8nd", Name = "phukien.jpg", CategoryId = accessoryCategoryId },
                new Image { Id = Guid.NewGuid().ToString(), Url = "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756314610/resibuy/noithat_steelt.jpg", ThumbUrl = "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/v1/resibuy/noithat_steelt", Name = "noithat.jpg", CategoryId = furnitureCategoryId },
                new Image { Id = Guid.NewGuid().ToString(), Url = "https://res.cloudinary.com/dhz6zqwxx/image/upload/v1756315891/other.jpg", ThumbUrl = "http://res.cloudinary.com/dhz6zqwxx/image/upload/c_fill,h_300,w_300/other", Name = "khac1.jpg", CategoryId = otherCategoryId }
            );
        }
    }
}
