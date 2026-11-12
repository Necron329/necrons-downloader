mod commands;

use tauri::Builder;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(commands::state())
        .invoke_handler(tauri::generate_handler![commands::analyze, commands::download])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}