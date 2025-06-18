using System.Text.Json.Serialization;

namespace ResiBuy.BackgroundTask;

public class CheckoutMessage
{
    [JsonPropertyName("userId")]
    public string UserId { get; set; } = string.Empty;

    [JsonPropertyName("orderId")]
    public string OrderId { get; set; } = string.Empty;

    [JsonPropertyName("totalAmount")]
    public decimal TotalAmount { get; set; }

    [JsonPropertyName("items")]
    public List<CheckoutItem> Items { get; set; } = new();

    [JsonPropertyName("timestamp")]
    public DateTime Timestamp { get; set; }
}

public class CheckoutItem
{
    [JsonPropertyName("productId")]
    public string ProductId { get; set; } = string.Empty;

    [JsonPropertyName("quantity")]
    public int Quantity { get; set; }

    [JsonPropertyName("price")]
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