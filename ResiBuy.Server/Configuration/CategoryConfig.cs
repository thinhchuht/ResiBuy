namespace ResiBuy.Server.Configuration
{
    public class CategoryConfig : IEntityTypeConfiguration<Category>
    {
        public void Configure(EntityTypeBuilder<Category> builder)
        {

            builder.HasOne(pd => pd.Image)
                .WithOne(i => i.Category)
                .HasForeignKey<Image>(i => i.CategoryId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Cascade);

        }
    }
}
