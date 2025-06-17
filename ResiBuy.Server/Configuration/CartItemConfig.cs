namespace ResiBuy.Server.Configuration
{
    public class CartItemConfig : IEntityTypeConfiguration<CartItem>
    {
        public void Configure(EntityTypeBuilder<CartItem> builder)
        {
            // Mối quan hệ
            builder.HasOne(ci => ci.Cart)
                   .WithMany(c => c.CartItems)
                   .HasForeignKey(ci => ci.CartId)
                   .OnDelete(DeleteBehavior.Cascade); // Xóa Cart sẽ xóa CartItem

            builder.HasOne(ci => ci.Product)
                   .WithMany(p => p.CartItems)
                   .HasForeignKey(ci => ci.ProductId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(ci => ci.CostData)
                .WithMany()
                .HasForeignKey(ci => ci.CostDataId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 