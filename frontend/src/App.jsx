import "./index.css";
import { FaReact } from "react-icons/fa";
import { Icon } from "@iconify/react";

function App() {
  return (
    <>
    <div className="flex items-center justify-center h-screen bg-gray-100">

      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <div className="flex items-center gap-4 mt-3">
        <FaReact size={30} color="#61DAFB" />
        <Icon icon="mdi:github" width="30" height="30" />
      </div>
    </div>
    </>
  );
}

export default App;