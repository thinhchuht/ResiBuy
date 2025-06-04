using System.ComponentModel.DataAnnotations;

namespace ResiBuy.Server.Infrastructure.Model
{
    public class RefreshToken
    {
        [Key]
        public string    Token           { get; set; }
        public string    UserId          { get; set; }
        public DateTime  ExpiryDate      { get; set; }
        public bool      IsRevoked       { get; set; }
        public DateTime  CreatedAt       { get; set; }
        public DateTime? RevokedAt       { get; set; }
        public string    ReplacedByToken { get; set; }
        public string    ReasonRevoked   { get; set; }
        public virtual   User User       { get; set; }
    }
}
