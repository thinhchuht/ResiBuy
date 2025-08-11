namespace ResiBuy.Server.Infrastructure.Model
{
    public class Category
    {
        public Guid                 Id       { get; set; }
        public string               Name     { get; set; }
        public bool               Status   { get; set; }
        public Image                Image    { get; set; }
        public IEnumerable<Product> Products { get; set; }


        public Category(string name, bool status)
        {
            Name = name;
            Status = status;
        }

        public void UpdateCategory(string name, bool status)
        {
            Name = name;
            Status = status;
        }
    }
}
