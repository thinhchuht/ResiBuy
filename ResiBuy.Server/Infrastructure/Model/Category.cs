namespace ResiBuy.Server.Infrastructure.Model
{
    public class Category
    {
        public Guid                 Id       { get; set; }
        public string               Name     { get; set; }
        public string               Status   { get; set; }
        public string               ImageId  { get; set; }
        public Image                Image    { get; set; }
        public IEnumerable<Product> Products { get; set; }
    }
}
