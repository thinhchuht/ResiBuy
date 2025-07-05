namespace ResiBuy.Server.Services.OpenRouteService
{
    public class CoordinateRequest
    {
        [JsonPropertyName("coordinates")]
        public List<List<double>> Coordinates { get; set; }
    }
}
