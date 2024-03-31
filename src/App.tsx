import { Route, Routes } from "react-router-dom";
import "./App.css";
// import { supabase } from "@/utils/supabase";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import GL from "./pages/GL";
import GP from "./pages/GP";
import OC from "./pages/OC";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/GL" element={<GL />} />
        <Route path="/GP" element={<GP />} />
        <Route path="/OC" element={<OC />} />
      </Route>
    </Routes>
  );
  // const [count, setCount] = useState(0);
  // const [todos, setTodos] = useState<any[] | null>([]);
  // useEffect(() => {
  //   async function getTodos() {
  //     const { data: todos } = await supabase.from("foc_user").select();
  //     if (todos && todos.length > 1) {
  //       setTodos(todos);
  //     }
  //   }
  //   getTodos();
  // }, []);
  // return (
  // <>
  //   <div>
  //     <a href="https://vitejs.dev" target="_blank">
  //       <img src={viteLogo} className="logo" alt="Vite logo" />
  //     </a>
  //     <a href="https://react.dev" target="_blank">
  //       <img src={reactLogo} className="logo react" alt="React logo" />
  //     </a>
  //   </div>
  //   <h1>Vite + React</h1>
  //   <div>
  //     {todos && todos.map((todo) => <li key={todo.name}>{todo.name}</li>)}
  //   </div>
  //   <div className="card">
  //     <button onClick={() => setCount((count) => count + 1)}>
  //       count is {count}
  //     </button>
  //     <p>
  //       Edit <code>src/App.tsx</code> and save to test HMR
  //     </p>
  //   </div>
  //   <p className="read-the-docs">
  //     Click on the Vite and React logos to learn more
  //   </p>
  // </>
  // );
}

export default App;
