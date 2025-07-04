using Newtonsoft.Json.Linq;
using System.Web;

namespace ResiBuy.Server.Services.ShippingCost
{
    public class GoogleDistanceService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public GoogleDistanceService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["GoogleMaps:ApiKey"];
        }

        public async Task<double> GetDistanceInMetersAsync(
            double originLat, double originLng,
            double destinationLat, double destinationLng,
            string mode = "walking") // mode: "driving", "walking", etc.
        {
            var baseUrl = "https://maps.googleapis.com/maps/api/distancematrix/json";

            var query = HttpUtility.ParseQueryString(string.Empty);
            query["origins"] = $"{originLat},{originLng}";
            query["destinations"] = $"{destinationLat},{destinationLng}";
            query["mode"] = mode;
            query["key"] = _apiKey;

            var url = $"{baseUrl}?{query}";

            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode)
            {
                throw new CustomException(
                    ExceptionErrorCode.RepositoryError,
                    $"Google API call failed with status code: {response.StatusCode}"
                );
            }

            var content = await response.Content.ReadAsStringAsync();
            var json = JObject.Parse(content);

            var globalStatus = json["status"]?.ToString();
            if (globalStatus != "OK")
            {
                throw new CustomException(
                    ExceptionErrorCode.InvalidInput,
                    $"Google API error: {globalStatus}"
                );
            }

            var element = json["rows"]?[0]?["elements"]?[0];
            var elementStatus = element?["status"]?.ToString();
            if (elementStatus != "OK")
            {
                throw new CustomException(
                    ExceptionErrorCode.NotFound,
                    $"Distance data not found: {elementStatus}"
                );
            }

            var distance = element["distance"]?["value"]?.ToObject<double>();
            if (distance == null)
            {
                throw new CustomException(
                    ExceptionErrorCode.RepositoryError,
                    "Distance value could not be parsed from Google API response."
                );
            }

            return distance.Value;
        }
    }
}
