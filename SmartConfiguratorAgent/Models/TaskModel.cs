namespace SmartConfigurator.Agent.Models
{
    public class TaskModel
    {
        public int Id { get; set; }
        public double Length { get; set; }
        public double Height { get; set; }
        public double Depth { get; set; }
        public string Status { get; set; } = "pending";
    }

}