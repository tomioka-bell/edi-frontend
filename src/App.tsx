import Router from "./router";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div>
     <Toaster position="top-right" />
     <Router />
    </div>
  );
}

export default App;