package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

type Product struct {
	ID          int     `json:"id"`
	Name        string  `json:"name"`
	Price       float64 `json:"price"`
	Description string  `json:"description"`
}

var products []Product

func init() {
	products = []Product{
		{ID: 1, Name: "Laptop", Price: 999.99, Description: "High-performance laptop"},
		{ID: 2, Name: "Mouse", Price: 29.99, Description: "Wireless mouse"},
		{ID: 3, Name: "Keyboard", Price: 79.99, Description: "Mechanical keyboard"},
	}
}

func getProducts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}

func getProduct(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	params := mux.Vars(r)
	id, _ := strconv.Atoi(params["id"])
	
	for _, product := range products {
		if product.ID == id {
			json.NewEncoder(w).Encode(product)
			return
		}
	}
	
	http.Error(w, "Product not found", http.StatusNotFound)
}

func createProduct(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var product Product
	_ = json.NewDecoder(r.Body).Decode(&product)
	product.ID = len(products) + 1
	products = append(products, product)
	json.NewEncoder(w).Encode(product)
}

func deleteProduct(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	params := mux.Vars(r)
	id, _ := strconv.Atoi(params["id"])
	
	for index, product := range products {
		if product.ID == id {
			products = append(products[:index], products[index+1:]...)
			json.NewEncoder(w).Encode(map[string]string{"message": "Product deleted"})
			return
		}
	}
	
	http.Error(w, "Product not found", http.StatusNotFound)
}

func home(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Go API Server", "version": "1.0.0"})
}

func main() {
	router := mux.NewRouter()
	
	router.HandleFunc("/", home).Methods("GET")
	router.HandleFunc("/api/products", getProducts).Methods("GET")
	router.HandleFunc("/api/products/{id}", getProduct).Methods("GET")
	router.HandleFunc("/api/products", createProduct).Methods("POST")
	router.HandleFunc("/api/products/{id}", deleteProduct).Methods("DELETE")
	
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"*"},
	})
	
	handler := c.Handler(router)
	
	fmt.Println("Server starting on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", handler))
}