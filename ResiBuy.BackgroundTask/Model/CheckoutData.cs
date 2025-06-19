using System.Text.Json.Serialization;

namespace ResiBuy.BackgroundTask.Model;

public class CheckoutData
{
    public string UserId { get; set; } = string.Empty;

    public string AddressId { get; set; } = string.Empty;

    public decimal GrandTotal { get; set; }
    public string PaymentMethod { get; set; }

    public List<Order> Orders { get; set; } = new();


}

public class Order
{
    public Guid Id { get; set; }

    public Guid StoreId { get; set; }
    public Guid? VoucherId { get; set; }
    public string Note { get; set; }
    public decimal TotalPrice { get; set; }
    public IEnumerable<Items> Items { get; set; }
}


public class Items
{
    public int ProductDetailId { get; set; }

    public int Quantity { get; set; }

    public decimal Price { get; set; }
}

public class ResiMessage
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty; // "area", "building", "room"

    [JsonPropertyName("action")]
    public string Action { get; set; } = string.Empty; // "create", "update", "delete"

    [JsonPropertyName("data")]
    public object Data { get; set; } = new();

    [JsonPropertyName("timestamp")]
    public DateTime Timestamp { get; set; }
}