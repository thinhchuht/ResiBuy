namespace ResiBuy.Server.Configuration
{
    public class OrderItemConfig : IEntityTypeConfiguration<OrderItem>
    {
        public void Configure(EntityTypeBuilder<OrderItem> builder)
        {
            // Mối quan hệ
            builder.HasOne(oi => oi.Order)
                   .WithMany(o => o.Items)
                   .HasForeignKey(oi => oi.OrderId)
                   .OnDelete(DeleteBehavior.Cascade); // Xóa Order sẽ xóa OrderItem

            builder.HasOne(oi => oi.ProductDetail)
                   .WithMany(p => p.OrderItems)
                   .HasForeignKey(oi => oi.ProductDetailId)
                   .OnDelete(DeleteBehavior.Restrict); // Ngăn xóa ProductDetail nếu có OrderItem
        }
    }
}