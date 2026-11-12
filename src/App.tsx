import "./index.css";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

interface Info {
  title: string;
  count: number;
  duration: number | null;
}

function App() {
  const [url, setUrl] = useState("");
  const [info, setInfo] = useState("");
  const [video, setVideo] = useState<Info | null>(null);
  const [playlist, setPlaylist] = useState(false);
  const [format, setFormat] = useState("mp3");
  const [dir, setDir] = useState("");

  const handleAnalyze = async () => {
    if (!url) { setInfo("fail: URL is required"); return; }
    setInfo("analyzing...");
    try {
      const data = await invoke<Info>("analyze", { url, playlist });
      setVideo(data);
      setInfo(`success: ${data.title}`);
    } catch (e) { setInfo(`fail: ${e}`); }
  };

  const handleDownload = async () => {
    if (!url) { setInfo("fail: URL is required"); return; }
    setInfo("downloading...");
    try {
      const paths = await invoke<string[]>("download", { url, playlist, format, dir: dir || null });
      setInfo(`success: saved ${paths.length} file(s)`);
    } catch (e) { setInfo(`fail: ${e}`); }
  };

  const handleBrowse = async () => {
    try {
      const picked = await open({ directory: true });
      if (picked) setDir(picked);
    } catch (e) { setInfo(`fail: ${e}`); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center gap-4 p-4">
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
      <div className="flex items-center gap-2 w-80">
        <input
          type="checkbox"
          id="playlist"
          checked={playlist}
          onChange={(e) => setPlaylist(e.target.checked)}
          className="accent-purple-500"
        />
        <label htmlFor="playlist" className="text-sm text-gray-300">
          Playlist
        </label>
      </div>
      <div className="flex gap-4 w-80">
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="radio"
            name="format"
            value="mp3"
            checked={format === "mp3"}
            onChange={() => setFormat("mp3")}
            className="accent-purple-500"
          />
          MP3
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="radio"
            name="format"
            value="mp4"
            checked={format === "mp4"}
            onChange={() => setFormat("mp4")}
            className="accent-purple-500"
          />
          MP4
        </label>
      </div>
      <div className="flex gap-2 w-80">
        <input
          type="text"
          value={dir}
          onChange={(e) => setDir(e.target.value)}
          placeholder="Download directory (default: Downloads)"
          className="flex-1 bg-gray-800/80 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={handleBrowse}
          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2.5 rounded-lg"
        >
          Browse
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleAnalyze}
          className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition shadow-lg shadow-purple-500/25"
        >
          Analyze
        </button>
        <button
          onClick={handleDownload}
          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition shadow-lg shadow-emerald-500/25"
        >
          Download
        </button>
      </div>
      {video && (
        <div className="text-sm text-gray-300 text-center">
          <div><b>Title:</b> {video.title}</div>
          {video.count > 1 && <div><b>Videos:</b> {video.count}</div>}
          {video.duration && <div><b>Duration:</b> {video.duration}s</div>}
        </div>
      )}
      <div className="mt-2 text-sm text-gray-300 min-h-[1.5rem]">{info}</div>
    </div>
  );
}

export default App;