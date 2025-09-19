namespace ResiBuy.Server.Configuration
{
    public class BarcodeConfig : IEntityTypeConfiguration<Barcode>
    {
        public void Configure(EntityTypeBuilder<Barcode> builder)
        {
            // Mối quan hệ
            builder.HasOne(v => v.ProductDetail)
                   .WithMany(s => s.Barcodes)
                   .HasForeignKey(v => v.ProductDetailId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(v => v.OrderItem)
                   .WithMany(s => s.Barcodes)
                   .HasForeignKey(v => v.OrderItemId)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasIndex(b => b.Code)
                   .IsUnique();
        }
    }
} 