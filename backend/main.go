package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"prescripto-go/config"
	"prescripto-go/routes"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Connect to database
	config.ConnectMongoDB()
	config.ConnectCloudinary()

	// Setup Gin router
	r := gin.Default()

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		AllowCredentials: true,
	}))

	// API routes
	api := r.Group("/api")
	{
		api.GET("/", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "API Working"})
		})

		// User routes
		userGroup := api.Group("/user")
		routes.UserRoutes(userGroup)

		// Doctor routes
		doctorGroup := api.Group("/doctor")
		routes.DoctorRoutes(doctorGroup)

		// Admin routes
		adminGroup := api.Group("/admin")
		routes.AdminRoutes(adminGroup)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "4000"
	}

	log.Printf("Server started on PORT:%s", port)
	log.Fatal(r.Run(":" + port))
}