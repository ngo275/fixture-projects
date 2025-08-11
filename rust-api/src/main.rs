use actix_cors::Cors;
use actix_web::{web, App, HttpResponse, HttpServer, Responder, Result};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Serialize, Deserialize, Clone)]
struct Task {
    id: u32,
    title: String,
    completed: bool,
}

struct AppState {
    tasks: Mutex<Vec<Task>>,
}

async fn get_tasks(data: web::Data<AppState>) -> Result<impl Responder> {
    let tasks = data.tasks.lock().unwrap();
    Ok(HttpResponse::Ok().json(&*tasks))
}

async fn get_task(
    path: web::Path<u32>,
    data: web::Data<AppState>,
) -> Result<impl Responder> {
    let task_id = path.into_inner();
    let tasks = data.tasks.lock().unwrap();
    
    match tasks.iter().find(|t| t.id == task_id) {
        Some(task) => Ok(HttpResponse::Ok().json(task)),
        None => Ok(HttpResponse::NotFound().body("Task not found")),
    }
}

async fn create_task(
    task: web::Json<Task>,
    data: web::Data<AppState>,
) -> Result<impl Responder> {
    let mut tasks = data.tasks.lock().unwrap();
    let mut new_task = task.into_inner();
    new_task.id = tasks.len() as u32 + 1;
    tasks.push(new_task.clone());
    Ok(HttpResponse::Created().json(&new_task))
}

async fn update_task(
    path: web::Path<u32>,
    task: web::Json<Task>,
    data: web::Data<AppState>,
) -> Result<impl Responder> {
    let task_id = path.into_inner();
    let mut tasks = data.tasks.lock().unwrap();
    
    match tasks.iter_mut().find(|t| t.id == task_id) {
        Some(existing_task) => {
            existing_task.title = task.title.clone();
            existing_task.completed = task.completed;
            Ok(HttpResponse::Ok().json(existing_task.clone()))
        }
        None => Ok(HttpResponse::NotFound().body("Task not found")),
    }
}

async fn delete_task(
    path: web::Path<u32>,
    data: web::Data<AppState>,
) -> Result<impl Responder> {
    let task_id = path.into_inner();
    let mut tasks = data.tasks.lock().unwrap();
    
    match tasks.iter().position(|t| t.id == task_id) {
        Some(index) => {
            tasks.remove(index);
            Ok(HttpResponse::Ok().body("Task deleted"))
        }
        None => Ok(HttpResponse::NotFound().body("Task not found")),
    }
}

async fn index() -> Result<impl Responder> {
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "Rust API with Actix Web",
        "version": "0.1.0"
    })))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Starting Rust API server on http://127.0.0.1:8081");
    
    let app_state = web::Data::new(AppState {
        tasks: Mutex::new(vec![
            Task {
                id: 1,
                title: "Learn Rust".to_string(),
                completed: false,
            },
            Task {
                id: 2,
                title: "Build API".to_string(),
                completed: true,
            },
        ]),
    });
    
    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header();
            
        App::new()
            .app_data(app_state.clone())
            .wrap(cors)
            .route("/", web::get().to(index))
            .route("/api/tasks", web::get().to(get_tasks))
            .route("/api/tasks", web::post().to(create_task))
            .route("/api/tasks/{id}", web::get().to(get_task))
            .route("/api/tasks/{id}", web::put().to(update_task))
            .route("/api/tasks/{id}", web::delete().to(delete_task))
    })
    .bind("127.0.0.1:8081")?
    .run()
    .await
}