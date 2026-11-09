import "./index.css";
import { useState } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [info, setInfo] = useState("");

  const handleAnalyze = () => {
    if (!url) {
      setInfo("fail: URL is required");
      return;
    }
    setInfo("success: analyzing " + url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center gap-6 p-4">
      <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
        Necrons Downloader
      </div>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL"
        className="w-80 bg-gray-800/80 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <button
        onClick={handleAnalyze}
        className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition shadow-lg shadow-purple-500/25"
      >
        Analyze
      </button>
      <div className="mt-2 text-sm text-gray-300 min-h-[1.5rem]">{info}</div>
    </div>
  );
}

export default App;