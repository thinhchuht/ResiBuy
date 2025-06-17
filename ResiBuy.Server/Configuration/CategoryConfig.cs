namespace ResiBuy.Server.Configuration
{
    public class CategoryConfig : IEntityTypeConfiguration<Category>
    {
        public void Configure(EntityTypeBuilder<Category> builder)
        {
            // Mối quan hệ
            builder.HasOne(c => c.Image)
                   .WithOne(u => u.Category) // Giả định User có một Category (từ câu hỏi trước)
                   .HasForeignKey<Category>(c => c.ImageId)
                   .OnDelete(DeleteBehavior.Restrict); // Xóa User sẽ xóa Category


        }
    }
}
