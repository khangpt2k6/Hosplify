package controllers

import (
	"context"
	"encoding/json"  // ADD THIS
	"net/http"
	"os"
	"strconv"       // ADD THIS

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"prescripto-go/config"
	"prescripto-go/models"
	"prescripto-go/utils"
)

// LoginAdmin handles admin login
func LoginAdmin(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Missing Details",
		})
		return
	}

	adminEmail := os.Getenv("ADMIN_EMAIL")
	adminPassword := os.Getenv("ADMIN_PASSWORD")

	if req.Email == adminEmail && req.Password == adminPassword {
		token, err := utils.GenerateAdminJWT(adminEmail + adminPassword)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.APIResponse{
				Success: false,
				Message: "Error generating token",
			})
			return
		}

		c.JSON(http.StatusOK, models.APIResponse{
			Success: true,
			Token:   token,
		})
	} else {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid credentials",
		})
	}
}

// GetAllAppointments gets all appointments for admin
func GetAllAppointments(c *gin.Context) {
	appointmentCollection := config.GetCollection("appointments")
	cursor, err := appointmentCollection.Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}
	defer cursor.Close(context.Background())

	var appointments []models.Appointment
	if err = cursor.All(context.Background(), &appointments); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    appointments,
	})
}

// CancelAppointmentAdmin cancels an appointment by admin
func CancelAppointmentAdmin(c *gin.Context) {
	var req models.CancelAppointmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Missing Details",
		})
		return
	}

	appointmentObjectID, _ := primitive.ObjectIDFromHex(req.AppointmentID)

	appointmentCollection := config.GetCollection("appointments")
	_, err := appointmentCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": appointmentObjectID},
		bson.M{"$set": bson.M{"cancelled": true}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Appointment Cancelled",
	})
}

// AddDoctor adds a new doctor
func AddDoctor(c *gin.Context) {
	var req models.AddDoctorRequest
	
	// Parse form data
	req.Name = c.PostForm("name")
	req.Email = c.PostForm("email")
	req.Password = c.PostForm("password")
	req.Speciality = c.PostForm("speciality")
	req.Degree = c.PostForm("degree")
	req.Experience = c.PostForm("experience")
	req.About = c.PostForm("about")
	
	// Parse fees
	if feesStr := c.PostForm("fees"); feesStr != "" {
		if fees, err := strconv.ParseFloat(feesStr, 64); err == nil {
			req.Fees = fees
		}
	}
	
	// Parse address JSON
	if addressStr := c.PostForm("address"); addressStr != "" {
		if err := json.Unmarshal([]byte(addressStr), &req.Address); err != nil {
			c.JSON(http.StatusBadRequest, models.APIResponse{
				Success: false,
				Message: "Invalid address format",
			})
			return
		}
	}

	// Validate required fields
	if req.Name == "" || req.Email == "" || req.Password == "" || req.Speciality == "" || 
	   req.Degree == "" || req.Experience == "" || req.About == "" || req.Fees == 0 {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Missing Details",
		})
		return
	}

	// Validate email format
	if !utils.IsValidEmail(req.Email) {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Please enter a valid email",
		})
		return
	}

	// Validate password length
	if len(req.Password) < 8 {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Please enter a strong password",
		})
		return
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Error processing password",
		})
		return
	}

	// Handle image upload
	file, header, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Image is required",
		})
		return
	}
	defer file.Close()

	imageURL, err := utils.UploadToCloudinary(file, header.Filename)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Error uploading image",
		})
		return
	}

	// Create doctor
	doctor := models.NewDoctor()
	doctor.Name = req.Name
	doctor.Email = req.Email
	doctor.Password = hashedPassword
	doctor.Image = imageURL
	doctor.Speciality = req.Speciality
	doctor.Degree = req.Degree
	doctor.Experience = req.Experience
	doctor.About = req.About
	doctor.Fees = req.Fees
	doctor.Address = req.Address

	collection := config.GetCollection("doctors")
	_, err = collection.InsertOne(context.Background(), doctor)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			c.JSON(http.StatusBadRequest, models.APIResponse{
				Success: false,
				Message: "Doctor with this email already exists",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Doctor Added",
	})
}

// GetAllDoctors gets all doctors for admin
func GetAllDoctors(c *gin.Context) {
	collection := config.GetCollection("doctors")
	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}
	defer cursor.Close(context.Background())

	var doctors []models.Doctor
	if err = cursor.All(context.Background(), &doctors); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	// Remove passwords from response
	for i := range doctors {
		doctors[i].Password = ""
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    doctors,
	})
}

// GetAdminDashboard gets dashboard data for admin
func GetAdminDashboard(c *gin.Context) {
	// Get doctors count
	doctorCollection := config.GetCollection("doctors")
	doctorCount, err := doctorCollection.CountDocuments(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	// Get users count
	userCollection := config.GetCollection("users")
	userCount, err := userCollection.CountDocuments(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	// Get appointments
	appointmentCollection := config.GetCollection("appointments")
	cursor, err := appointmentCollection.Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}
	defer cursor.Close(context.Background())

	var appointments []models.Appointment
	if err = cursor.All(context.Background(), &appointments); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	// Reverse appointments for latest first
	for i, j := 0, len(appointments)-1; i < j; i, j = i+1, j-1 {
		appointments[i], appointments[j] = appointments[j], appointments[i]
	}

	dashData := models.DashboardData{
		Doctors:            int(doctorCount),
		Appointments:       len(appointments),
		Patients:           int(userCount),
		LatestAppointments: appointments,
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    dashData,
	})
}