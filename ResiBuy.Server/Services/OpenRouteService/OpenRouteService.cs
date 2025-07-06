namespace ResiBuy.Server.Services.OpenRouteService
{
    public class OpenRouteService
    {
        private readonly HttpClient _httpClient;
        private const string ApiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjM5M2Q4YmY1YjZjMzQ4MDNiODliMWFhMDVhOGUxZDNlIiwiaCI6Im11cm11cjY0In0="; // <-- Nên đưa ra config sau này

        public OpenRouteService(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {ApiKey}");
        }

        public async Task<ORSRouteResponse> GetRouteAsync(double startLon, double startLat, double endLon, double endLat)
        {
            var requestBody = new CoordinateRequest
            {
                Coordinates = new List<List<double>>
                {
                    new List<double> { startLon, startLat },
                    new List<double> { endLon, endLat }
                }
            };

            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("https://api.openrouteservice.org/v2/directions/foot-walking", content);

            if (!response.IsSuccessStatusCode)
                throw new Exception("Request failed: " + response.StatusCode);

            var responseText = await response.Content.ReadAsStringAsync();

            var orsResponse = JsonSerializer.Deserialize<ORSRouteResponse>(responseText, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return orsResponse;
        }
    }
}
