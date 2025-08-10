package config

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/cloudinary/cloudinary-go/v2"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	MongoDB    *mongo.Database
	Cloudinary *cloudinary.Cloudinary
)

// ConnectMongoDB connects to MongoDB database
func ConnectMongoDB() {
	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		log.Fatal("MONGODB_URI environment variable not set")
	}

	// Create a context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Connect to MongoDB
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI+"/prescripto"))
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	// Ping the database
	if err := client.Ping(ctx, nil); err != nil {
		log.Fatal("Failed to ping MongoDB:", err)
	}

	MongoDB = client.Database("prescripto")
	log.Println("Database Connected")
}

// ConnectCloudinary configures Cloudinary
func ConnectCloudinary() {
	cloudName := os.Getenv("CLOUDINARY_NAME")
	apiKey := os.Getenv("CLOUDINARY_API_KEY")
	secretKey := os.Getenv("CLOUDINARY_SECRET_KEY")

	if cloudName == "" || apiKey == "" || secretKey == "" {
		log.Fatal("Cloudinary environment variables not set")
	}

	var err error
	Cloudinary, err = cloudinary.NewFromParams(cloudName, apiKey, secretKey)
	if err != nil {
		log.Fatal("Failed to configure Cloudinary:", err)
	}

	log.Println("Cloudinary Connected")
}

// GetCollection returns a collection from MongoDB
func GetCollection(name string) *mongo.Collection {
	return MongoDB.Collection(name)
}