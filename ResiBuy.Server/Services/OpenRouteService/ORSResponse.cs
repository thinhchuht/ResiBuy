namespace ResiBuy.Server.Services.OpenRouteService
{
    public class ORSRouteResponse
    {
        [JsonPropertyName("bbox")]
        public List<double> Bbox { get; set; }

        [JsonPropertyName("routes")]
        public List<Route> Routes { get; set; }
    }

    public class Route
    {
        [JsonPropertyName("summary")]
        public Summary Summary { get; set; }

        [JsonPropertyName("segments")]
        public List<Segment> Segments { get; set; }
    }

    public class Summary
    {
        [JsonPropertyName("distance")]
        public double Distance { get; set; }

        [JsonPropertyName("duration")]
        public double Duration { get; set; }
    }

    public class Segment
    {
        [JsonPropertyName("distance")]
        public double Distance { get; set; }

        [JsonPropertyName("duration")]
        public double Duration { get; set; }

        [JsonPropertyName("steps")]
        public List<Step> Steps { get; set; }
    }

    public class Step
    {
        [JsonPropertyName("instruction")]
        public string Instruction { get; set; }

        [JsonPropertyName("distance")]
        public double Distance { get; set; }

        [JsonPropertyName("duration")]
        public double Duration { get; set; }

        [JsonPropertyName("type")]
        public int Type { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("way_points")]
        public List<int> WayPoints { get; set; }
    }

}
