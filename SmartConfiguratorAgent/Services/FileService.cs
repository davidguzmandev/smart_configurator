using SmartConfigurator.Agent.Models;
using SmartConfigurator.Agent.Utils;

namespace SmartConfigurator.Agent.Services
{
    public class FileService
    {
        public void SavePartAndDrawing(TaskModel task)
        {
            string pdfPath = Path.Combine(Config.OutputPath, $"cube_{task.Length}x{task.Height}x{task.Depth}.pdf");
            // Aquí se podría agregar el método para exportar el plano a PDF
            LoggerService.Log($"PDF saved: {pdfPath}");
        }
    }
}
