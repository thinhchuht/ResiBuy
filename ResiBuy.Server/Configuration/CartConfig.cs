namespace ResiBuy.Server.Configuration
{
    public class CartConfig : IEntityTypeConfiguration<Cart>
    {
        public void Configure(EntityTypeBuilder<Cart> builder)
        {
            // Mối quan hệ
            builder.HasOne(c => c.User)
                   .WithOne(u => u.Cart) // Giả định User có một Cart (từ câu hỏi trước)
                   .HasForeignKey<Cart>(c => c.UserId)
                   .OnDelete(DeleteBehavior.Cascade); // Xóa User sẽ xóa Cart

            builder.HasMany(c => c.CartItems)
                   .WithOne(ci => ci.Cart)
                   .HasForeignKey(ci => ci.CartId)
                   .OnDelete(DeleteBehavior.Cascade); // Xóa Cart sẽ xóa CartItem
        }
    }
}