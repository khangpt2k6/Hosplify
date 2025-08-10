package controllers

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"prescripto-go/config"
	"prescripto-go/models"
	"prescripto-go/utils"
)

// LoginDoctor handles doctor login
func LoginDoctor(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Missing Details",
		})
		return
	}

	collection := config.GetCollection("doctors")
	var doctor models.Doctor
	err := collection.FindOne(context.Background(), bson.M{"email": req.Email}).Decode(&doctor)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid credentials",
		})
		return
	}

	// Check password
	if !utils.CheckPasswordHash(req.Password, doctor.Password) {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid credentials",
		})
		return
	}

	// Generate JWT token
	token, err := utils.GenerateJWT(doctor.ID.Hex())
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
}

// GetDoctorAppointments gets appointments for a doctor
func GetDoctorAppointments(c *gin.Context) {
	docID := c.GetString("docId")

	appointmentCollection := config.GetCollection("appointments")
	cursor, err := appointmentCollection.Find(context.Background(), bson.M{"docId": docID})
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

// CancelDoctorAppointment cancels an appointment by doctor
func CancelDoctorAppointment(c *gin.Context) {
	docID := c.GetString("docId")
	var req models.CancelAppointmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Missing Details",
		})
		return
	}

	appointmentObjectID, _ := primitive.ObjectIDFromHex(req.AppointmentID)

	// Get appointment data
	appointmentCollection := config.GetCollection("appointments")
	var appointment models.Appointment
	err := appointmentCollection.FindOne(context.Background(), bson.M{"_id": appointmentObjectID}).Decode(&appointment)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Appointment not found",
		})
		return
	}

	// Verify appointment belongs to doctor
	if appointment.DocID != docID {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Unauthorized action",
		})
		return
	}

	// Cancel appointment
	_, err = appointmentCollection.UpdateOne(
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

// CompleteAppointment marks an appointment as completed
func CompleteAppointment(c *gin.Context) {
	docID := c.GetString("docId")
	var req models.CancelAppointmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Missing Details",
		})
		return
	}

	appointmentObjectID, _ := primitive.ObjectIDFromHex(req.AppointmentID)

	// Get appointment data
	appointmentCollection := config.GetCollection("appointments")
	var appointment models.Appointment
	err := appointmentCollection.FindOne(context.Background(), bson.M{"_id": appointmentObjectID}).Decode(&appointment)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Appointment not found",
		})
		return
	}

	// Verify appointment belongs to doctor
	if appointment.DocID != docID {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Unauthorized action",
		})
		return
	}

	// Complete appointment
	_, err = appointmentCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": appointmentObjectID},
		bson.M{"$set": bson.M{"isCompleted": true}},
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
		Message: "Appointment Completed",
	})
}

// GetDoctorList gets all doctors for frontend
func GetDoctorList(c *gin.Context) {
	collection := config.GetCollection("doctors")
	cursor, err := collection.Find(context.Background(), bson.M{}, nil)
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

	// Remove password and email from response
	for i := range doctors {
		doctors[i].Password = ""
		doctors[i].Email = ""
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    doctors,
	})
}

// ChangeAvailability changes doctor availability
func ChangeAvailability(c *gin.Context) {
	docID := c.GetString("docId")
	if docID == "" {
		// This might be called from admin, get docId from request body
		var req models.ChangeAvailabilityRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, models.APIResponse{
				Success: false,
				Message: "Missing Details",
			})
			return
		}
		docID = req.DocID
	}

	docObjectID, _ := primitive.ObjectIDFromHex(docID)

	// Get current doctor data
	collection := config.GetCollection("doctors")
	var doctor models.Doctor
	err := collection.FindOne(context.Background(), bson.M{"_id": docObjectID}).Decode(&doctor)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Doctor not found",
		})
		return
	}

	// Toggle availability
	_, err = collection.UpdateOne(
		context.Background(),
		bson.M{"_id": docObjectID},
		bson.M{"$set": bson.M{"available": !doctor.Available}},
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
		Message: "Availability Changed",
	})
}

// GetDoctorProfile gets doctor profile
func GetDoctorProfile(c *gin.Context) {
	docID := c.GetString("docId")
	docObjectID, _ := primitive.ObjectIDFromHex(docID)

	collection := config.GetCollection("doctors")
	var doctor models.Doctor
	err := collection.FindOne(context.Background(), bson.M{"_id": docObjectID}).Decode(&doctor)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	// Remove password from response
	doctor.Password = ""

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    doctor,
	})
}

// UpdateDoctorProfile updates doctor profile
func UpdateDoctorProfile(c *gin.Context) {
	docID := c.GetString("docId")
	docObjectID, _ := primitive.ObjectIDFromHex(docID)

	var req models.UpdateDoctorProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Missing Details",
		})
		return
	}

	updateData := bson.M{
		"fees":      req.Fees,
		"address":   req.Address,
		"available": req.Available,
	}

	collection := config.GetCollection("doctors")
	_, err := collection.UpdateOne(
		context.Background(),
		bson.M{"_id": docObjectID},
		bson.M{"$set": updateData},
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
		Message: "Profile Updated",
	})
}

// GetDoctorDashboard gets dashboard data for doctor
func GetDoctorDashboard(c *gin.Context) {
	docID := c.GetString("docId")

	// Get all appointments for this doctor
	appointmentCollection := config.GetCollection("appointments")
	cursor, err := appointmentCollection.Find(context.Background(), bson.M{"docId": docID})
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

	// Calculate earnings
	var earnings float64
	uniquePatients := make(map[string]bool)

	for _, appointment := range appointments {
		if appointment.IsCompleted || appointment.Payment {
			earnings += appointment.Amount
		}
		uniquePatients[appointment.UserID] = true
	}

	// Reverse appointments for latest first
	for i, j := 0, len(appointments)-1; i < j; i, j = i+1, j-1 {
		appointments[i], appointments[j] = appointments[j], appointments[i]
	}

	dashData := models.DashboardData{
		Earnings:           earnings,
		Appointments:       len(appointments),
		Patients:           len(uniquePatients),
		LatestAppointments: appointments,
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    dashData,
	})
}