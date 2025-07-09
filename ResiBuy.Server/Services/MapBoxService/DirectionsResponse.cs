using Newtonsoft.Json;

namespace ResiBuy.Server.Services.MapBoxService
{
    public class DirectionsResponse
    {
        [JsonProperty("routes")]
        public List<Route> Routes { get; set; }

        [JsonProperty("code")]
        public string Code { get; set; }
    }

    public class Route
    {
        [JsonProperty("distance")]
        public double Distance { get; set; } // đơn vị: mét

        [JsonProperty("duration")]
        public double Duration { get; set; } // đơn vị: giây

        [JsonProperty("geometry")]
        public Geometry Geometry { get; set; }
    }

    public class Geometry
    {
        [JsonProperty("coordinates")]
        public List<List<double>> Coordinates { get; set; }

        [JsonProperty("type")]
        public string Type { get; set; }
    }
}
