import { useEffect, useState } from "react";
import { API_URL } from "../config";

interface Part {
  id: number;
  task_id: number;
  base_model: string;
  file_name: string;
  file_path: string;
  version_label: string;
  volume: number | null;
  created_at: string;
}

export const PartTable: React.FC = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchParts = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/parts`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      const data: Part[] = await res.json();
      setParts(data);
    } catch (err) {
      console.error(err);
      setError("❌ Error fetching parts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();

    // 🔁 Auto-refresh cada 10 segundos
    const interval = setInterval(fetchParts, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Loading parts...</p>;
  if (error) return <p>{error}</p>;
  if (parts.length === 0) return <p>No parts found.</p>;

  return (
    <div>
      <h1 className="text-xl font-bold">Parts List</h1>
      <p>Total Parts: {parts.length}</p>
      <table className="w-full border-collapse border mt-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">Task ID</th>
            <th className="border p-2">File Name</th>
            <th className="border p-2">Path</th>
            <th className="border p-2">Model</th>
            <th className="border p-2">Created At</th>
          </tr>
        </thead>
        <tbody>
          {parts.map((p) => (
            <tr key={p.id}>
              <td className="border p-2 text-center">{p.id}</td>
              <td className="border p-2 text-center">{p.task_id}</td>
              <td className="border p-2">{p.file_name}</td>
              <td className="border p-2">{p.file_path}</td>
              <td className="border p-2">{p.base_model}</td>
              <td className="border p-2 text-center">
                {new Date(p.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
