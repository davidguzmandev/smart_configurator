using System.Net.Http;
using System.Net.Http.Json;
using SmartConfigurator.Agent.Models;
using SmartConfigurator.Agent.Utils;

namespace SmartConfigurator.Agent.Services
{
    public class TaskService
    {
        private readonly HttpClient _client;

        public TaskService()
        {
            _client = new HttpClient
            {
                BaseAddress = new Uri(Config.API_URL)
            };
            // _client.DefaultRequestHeaders.Add("x-api-key", Config.API_KEY);
        }

        public async Task<TaskModel?> GetPendingTaskAsync()
        {
            try
            {
                var response = await _client.GetAsync("/api/tasks");
                if (!response.IsSuccessStatusCode) return null;

                var tasks = await response.Content.ReadFromJsonAsync<List<TaskModel>>();
                return tasks?.FirstOrDefault(t => t.Status == "pending");
            }
            catch (Exception ex)
            {
                LoggerService.Log($"Error fetching tasks: {ex.Message}");
                return null;
            }
        }

        public async Task UpdateTaskStatusAsync(int taskId, string status, string? name = null)
        {
            try
            {
                var payload = new { status, name }; // ← incluimos el nombre si existe
                var res = await _client.PatchAsJsonAsync($"/api/update-task/{taskId}", payload);

                if (res.IsSuccessStatusCode)
                {
                    LoggerService.Log($"Task {taskId} updated to '{status}'{(name != null ? $" with name '{name}'" : "")}");
                }
                else
                {
                    LoggerService.Log($"Failed to update task {taskId}: {res.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                LoggerService.Log($"Error updating task {taskId}: {ex.Message}");
            }
        }

    }
}