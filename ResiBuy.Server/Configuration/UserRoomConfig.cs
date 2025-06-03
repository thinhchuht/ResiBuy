namespace ResiBuy.Server.Configuration
{
    public class UserRoomConfig : IEntityTypeConfiguration<UserRoom>
    {
        public void Configure(EntityTypeBuilder<UserRoom> builder)
        {
            builder.HasKey(ur => new { ur.UserId, ur.RoomId });

            builder.HasOne(ur => ur.User)
                  .WithMany(u => u.UserRooms) 
                  .HasForeignKey(ur => ur.UserId)
                  .OnDelete(DeleteBehavior.Cascade); //Xóa User sẽ xóa UserRoom

            builder.HasOne(ur => ur.Room)
                  .WithMany(r => r.UserRooms) 
                  .HasForeignKey(ur => ur.RoomId)
                  .OnDelete(DeleteBehavior.Cascade); //Xóa Room sẽ xóa UserRoom
        }
    }
}
