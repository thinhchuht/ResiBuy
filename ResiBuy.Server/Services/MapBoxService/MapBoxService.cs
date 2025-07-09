namespace ResiBuy.Server.Services.MapBoxService
{
    public class MapBoxService
    {
        private readonly HttpClient _client;
        private readonly string _accessToken;

        public MapBoxService(HttpClient client)
        {
            _client = client;
            _accessToken = "pk.eyJ1IjoiYW5odm9ob2FuZ2h1eTI1IiwiYSI6ImNtY3VsZjg5YjAxNGcyanB4eXh4bjk1dmgifQ.Hn9KFCnwPZ9rJUBM9Erojg";
        }

        public async Task<DirectionsResponse> GetDirectionsAsync(double lon1, double lat1, double lon2 ,double lat2 , string profile = "walking")
        {
            string coordinates = $"{lon1.ToString(CultureInfo.InvariantCulture)},{lat1.ToString(CultureInfo.InvariantCulture)};" +
                                 $"{lon2.ToString(CultureInfo.InvariantCulture)},{lat2.ToString(CultureInfo.InvariantCulture)}";

            string url = $"https://api.mapbox.com/directions/v5/mapbox/{profile}/{coordinates}?geometries=geojson&overview=simplified&access_token={_accessToken}";

            var response = await _client.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            return Newtonsoft.Json.JsonConvert.DeserializeObject<DirectionsResponse>(json);
        }
    }
}
