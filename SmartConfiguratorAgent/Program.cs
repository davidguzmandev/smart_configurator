using SmartConfigurator.Agent.Models;
using SmartConfigurator.Agent.Services;

namespace SmartConfigurator.Agent
{
    internal class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("=== Smart Configurator Agent (C#) ===");

            var taskService = new TaskService();
            var swService = new SolidWorksService();
            var fileService = new FileService();

            while (true)
            {
                var pendingTask = await taskService.GetPendingTaskAsync();
                if (pendingTask == null)
                {
                    Console.WriteLine("No pending tasks. Waiting 10 seconds...");
                    await Task.Delay(10000);
                    continue;
                }

                Console.WriteLine($"Processing Task ID: {pendingTask.Id}");

                await taskService.UpdateTaskStatusAsync(pendingTask.Id, "processing");

                try
                {
                    swService.OpenPart(pendingTask);
                    swService.GenerateDrawing(pendingTask);
                    fileService.SavePartAndDrawing(pendingTask);

                    string fileName = $"cube_{pendingTask.Length}x{pendingTask.Height}x{pendingTask.Depth}.SLDPRT";
                    await taskService.UpdateTaskStatusAsync(pendingTask.Id, "done", fileName);
                    LoggerService.Log($"Task {pendingTask.Id} completed and updated SQL Parts");
                }
                catch (Exception ex)
                {
                    LoggerService.Log($"Error processing task {pendingTask.Id}: {ex.Message}");
                    await taskService.UpdateTaskStatusAsync(pendingTask.Id, "failed");
                }

                Console.WriteLine("Waiting 10 seconds before next check...");
                await Task.Delay(10000);
            }
        }
    }
}