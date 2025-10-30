using SmartConfigurator.Agent.Utils;

namespace SmartConfigurator.Agent.Services
{
    public static class LoggerService
    {
        private static readonly string LogPath = Path.Combine(Config.OutputPath, "agent_log.txt");

        public static void Log(string message)
        {
            string log = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] {message}";
            Console.WriteLine(log);
            File.AppendAllText(LogPath, log + Environment.NewLine);
        }
    }
}
