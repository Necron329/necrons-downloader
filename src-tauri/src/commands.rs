use std::sync::Mutex;

use serde::Serialize;
use tauri::State;
use yt_dlp::Downloader;

pub struct StateDL(Mutex<Option<Downloader>>);

#[derive(Serialize)]
pub struct VideoInfo {
    pub title: String,
    pub count: usize,
    pub duration: Option<f64>,
}

pub fn state() -> StateDL {
    StateDL(Mutex::new(None))
}

fn sanitize(name: &str) -> String {
    name.chars()
        .map(|c| if c.is_alphanumeric() || c == ' ' || c == '-' || c == '_' { c } else { '_' })
        .collect::<String>()
        .trim()
        .to_string()
}

#[tauri::command]
pub async fn analyze(
    state: State<'_, StateDL>,
    url: String,
    playlist: bool,
) -> Result<VideoInfo, String> {
    let dl = get_or_init(&state).await?;
    if playlist {
        let pl = dl.fetch_playlist_infos(&url).await.map_err(|e| e.to_string())?;
        let first = pl.entries.first();
        let duration = first.and_then(|e| e.duration);
        Ok(VideoInfo {
            title: pl.title,
            count: pl.entries.len(),
            duration,
        })
    } else {
        let v = dl.fetch_video_infos(&url).await.map_err(|e| e.to_string())?;
        Ok(VideoInfo {
            title: v.title,
            count: 1,
            duration: v.duration.map(|d| d as f64),
        })
    }
}

#[tauri::command]
pub async fn download(
    state: State<'_, StateDL>,
    url: String,
    playlist: bool,
    format: String,
    dir: Option<String>,
) -> Result<Vec<String>, String> {
    let dl = get_or_init(&state).await?;
    let out_dir = dir
        .map(std::path::PathBuf::from)
        .or_else(|| dirs::download_dir())
        .ok_or("no downloads folder")?;

    if playlist {
        let pl = dl.fetch_playlist_infos(&url).await.map_err(|e| e.to_string())?;
        let pl_dir = out_dir.join(sanitize(&pl.title));
        let _ = std::fs::create_dir_all(&pl_dir);
        let mut paths = Vec::new();
        for entry in &pl.entries {
            let v = dl.fetch_video_infos(&entry.url).await.map_err(|e| e.to_string())?;
            let name = sanitize(&v.title);
            let path = if format == "mp3" {
                pl_dir.join(format!("{}.mp3", name))
            } else {
                pl_dir.join(format!("{}.mp4", name))
            };
            let p = dl.download(&v, path).execute().await.map_err(|e| e.to_string())?;
            paths.push(p.to_string_lossy().to_string());
        }
        Ok(paths)
    } else {
        let v = dl.fetch_video_infos(&url).await.map_err(|e| e.to_string())?;
        let name = sanitize(&v.title);
        let path = if format == "mp3" {
            out_dir.join(format!("{}.mp3", name))
        } else {
            out_dir.join(format!("{}.mp4", name))
        };
        let p = dl.download(&v, path).execute().await.map_err(|e| e.to_string())?;
        Ok(vec![p.to_string_lossy().to_string()])
    }
}

async fn get_or_init(state: &State<'_, StateDL>) -> Result<Downloader, String> {
    {
        let guard = state.0.lock().unwrap();
        if let Some(dl) = guard.as_ref() {
            return Ok(dl.clone());
        }
    }
    let libs = std::env::current_dir().unwrap().join("libs");
    let _ = std::fs::create_dir_all(&libs);
    let builder = Downloader::with_new_binaries(libs.clone(), libs.clone())
        .await
        .map_err(|e| e.to_string())?;
    let dl = builder.build().await.map_err(|e| e.to_string())?;
    state.0.lock().unwrap().replace(dl.clone());
    Ok(dl)
}