namespace ResiBuy.Server.Infrastructure.Model
{
    public class Category
    {
        public Guid                 Id       { get; set; }
        public string               Name     { get; set; }
        public string               Status   { get; set; }
        public Image                Image    { get; set; }
        public IEnumerable<Product> Products { get; set; }


        public Category(string name, string status)
        {
            Name = name;
            Status = status;
        }

        public void UpdateCategory(string name, string status)
        {
            Name = name;
            Status = status;
        }
    }
}
