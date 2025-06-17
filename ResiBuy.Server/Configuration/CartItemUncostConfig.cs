namespace ResiBuy.Server.Configuration
{
    public class CartItemUncostConfig : IEntityTypeConfiguration<CartItemUncost>
    {
        public void Configure(EntityTypeBuilder<CartItemUncost> builder)
        {
            builder.HasKey(cu => new { cu.CartItemId, cu.UncostDataId });

            builder.HasOne(cu => cu.CartItem)
                .WithMany(u => u.CartItemUncosts)
                .HasForeignKey(cu => cu.CartItemId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(cu => cu.UncostData)
                .WithMany() 
                .HasForeignKey(cu => cu.UncostDataId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}