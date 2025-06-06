﻿namespace ResiBuy.Server.Infrastructure.Model
{
    public class Category
    {
        public Guid                 Id       { get; set; }
        public string               Name     { get; set; }
        public string               Status   { get; set; }
        public IEnumerable<Product> Products { get; set; }
    }
}
