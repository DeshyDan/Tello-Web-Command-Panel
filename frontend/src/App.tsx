import './App.css'
import Connect from "@/pages/Connect.tsx";

function App() {

    return (
        <>
            <Connect onConnect={() => console.log("Connection button pressed")} isConnected={false}/>
        </>
    )
}

export default App;