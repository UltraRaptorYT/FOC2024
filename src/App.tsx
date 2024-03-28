import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { supabase } from "@/utils/supabase";

function App() {
  const [count, setCount] = useState(0);
  const [todos, setTodos] = useState<any[] | null>([]);

  useEffect(() => {
    async function getTodos() {
      const { data: todos } = await supabase.from("foc_user").select();

      if (todos && todos.length > 1) {
        setTodos(todos);
      }
    }

    getTodos();
  }, []);
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div>
        {todos && todos.map((todo) => (
          <li key={todo.name}>{todo.name}</li>
        ))}
      </div>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
