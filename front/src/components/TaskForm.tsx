import { useState } from "react";
import { API_URL } from "../config";

interface TaskFormProps {
  onTaskCreated: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated }) => {
  const [length, setLength] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [depth, setDepth] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = { length, height, depth };

      const res = await fetch(`${API_URL}/generate-part`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const data = await res.json();
      console.log("✅ Task created:", data);
      setMessage("✅ Task created successfully!");
      onTaskCreated();
    } catch (err) {
      console.error(err);
      setMessage("❌ Error creating task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 ">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent pb-5">
            Smart Configurator
          </h1>
          <p className="text-gray-500">Enter your dimensions below</p>
        </div>

        {/* Card */}
        <div className="p-8 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Length */}
            <div className="space-y-1">
              <label
                htmlFor="length"
                className="block text-sm font-medium text-gray-700 flex items-center gap-2"
              >
                Length
                <span className="text-xs text-gray-400 font-normal">(mm)</span>
              </label>
              <input
                id="length"
                type="number"
                value={length || ""}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full h-12 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="0"
                required
              />
            </div>

            {/* Height */}
            <div className="space-y-1">
              <label
                htmlFor="height"
                className="block text-sm font-medium text-gray-700 flex items-center gap-2"
              >
                Height
                <span className="text-xs text-gray-400 font-normal">(mm)</span>
              </label>
              <input
                id="height"
                type="number"
                value={height || ""}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full h-12 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="0"
                required
              />
            </div>

            {/* Depth */}
            <div className="space-y-1">
              <label
                htmlFor="depth"
                className="block text-sm font-medium text-gray-700 flex items-center gap-2"
              >
                Depth
                <span className="text-xs text-gray-400 font-normal">(mm)</span>
              </label>
              <input
                id="depth"
                type="number"
                value={depth || ""}
                onChange={(e) => setDepth(Number(e.target.value))}
                className="w-full h-12 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="0"
                required
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-md bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-medium hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Create Task"
              )}
            </button>

            {/* Feedback */}
            {message && (
              <div className="p-3 rounded-md bg-blue-50 border border-blue-200 animate-fade-in text-blue-700 text-sm text-center font-medium">
                {message}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            All measurements are in millimeters
          </p>
        </div>
      </div>
    </div>
  );
};
