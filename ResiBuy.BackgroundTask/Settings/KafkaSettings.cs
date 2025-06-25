namespace ResiBuy.BackgroundTask.Settings;

public class KafkaSettings
{
    public string BootstrapServers { get; set; } = string.Empty;
    public string GroupId { get; set; } = string.Empty;
    public string[] Topics { get; set; } = Array.Empty<string>();
}