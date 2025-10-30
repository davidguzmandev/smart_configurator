import { useState } from "react";
import { TaskForm } from "./components/TaskForm";
import { PartTable } from "./components/PartTable";

function App() {
  const [reload, setReload] = useState(false);

  return (
    <div className="p-8 flex flex-col items-center ml-10">

      <TaskForm onTaskCreated={() => setReload(!reload)} />
      <PartTable key={reload.toString()} />
    </div>
  );
}

export default App;
