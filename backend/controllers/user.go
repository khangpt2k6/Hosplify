package controllers

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"time"

	"prescripto-go/config"
	"prescripto-go/models"
	"prescripto-go/utils"

	"github.com/gin-gonic/gin"
	"github.com/razorpay/razorpay-go"
	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/checkout/session"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// RegisterUser handles user registration
func RegisterUser(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
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

	// Create user
	user := models.NewUser()
	user.Name = req.Name
	user.Email = req.Email
	user.Password = hashedPassword

	collection := config.GetCollection("users")
	result, err := collection.InsertOne(context.Background(), user)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			c.JSON(http.StatusBadRequest, models.APIResponse{
				Success: false,
				Message: "User already exists",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	// Generate JWT token
	token, err := utils.GenerateJWT(result.InsertedID.(primitive.ObjectID).Hex())
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

// LoginUser handles user login
func LoginUser(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Missing Details",
		})
		return
	}

	collection := config.GetCollection("users")
	var user models.User
	err := collection.FindOne(context.Background(), bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "User does not exist",
		})
		return
	}

	// Check password
	if !utils.CheckPasswordHash(req.Password, user.Password) {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid credentials",
		})
		return
	}

	// Generate JWT token
	token, err := utils.GenerateJWT(user.ID.Hex())
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

// GetProfile gets user profile data
func GetProfile(c *gin.Context) {
	// Add debug logging
	fmt.Println("=== GetProfile Debug ===")
	
	userID := c.GetString("userId")
	fmt.Printf("UserID from context: '%s'\n", userID)
	
	if userID == "" {
		fmt.Println("ERROR: UserID is empty!")
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "User ID not found in context",
		})
		return
	}
	
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		fmt.Printf("ERROR: Invalid ObjectID: %v\n", err)
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid user ID format",
		})
		return
	}
	
	fmt.Printf("ObjectID: %v\n", objectID)

	collection := config.GetCollection("users")
	if collection == nil {
		fmt.Println("ERROR: Users collection is nil!")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Database collection error",
		})
		return
	}
	
	var user models.User
	err = collection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&user)
	if err != nil {
		fmt.Printf("ERROR: Database query failed: %v\n", err)
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: fmt.Sprintf("Database error: %v", err),
		})
		return
	}

	fmt.Printf("User found: %+v\n", user)
	fmt.Println("=== End Debug ===")

	// Return userData field to match frontend expectation
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"userData": user,
	})
}

// UpdateProfile updates user profile
func UpdateProfile(c *gin.Context) {
	userID := c.GetString("userId")
	objectID, _ := primitive.ObjectIDFromHex(userID)

	var req models.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Data Missing",
		})
		return
	}

	updateData := bson.M{
		"name":    req.Name,
		"phone":   req.Phone,
		"address": req.Address,
		"dob":     req.DOB,
		"gender":  req.Gender,
	}

	// Handle image upload if present
	file, header, err := c.Request.FormFile("image")
	if err == nil {
		defer file.Close()
		
		imageURL, err := utils.UploadToCloudinary(file, header.Filename)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.APIResponse{
				Success: false,
				Message: "Error uploading image",
			})
			return
		}
		updateData["image"] = imageURL
	}

	collection := config.GetCollection("users")
	_, err = collection.UpdateOne(
		context.Background(),
		bson.M{"_id": objectID},
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

// BookAppointment books an appointment
func BookAppointment(c *gin.Context) {
	userID := c.GetString("userId")
	var req models.BookAppointmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Missing Details",
		})
		return
	}

	docObjectID, _ := primitive.ObjectIDFromHex(req.DocID)
	userObjectID, _ := primitive.ObjectIDFromHex(userID)

	// Get doctor data
	doctorCollection := config.GetCollection("doctors")
	var doctor models.Doctor
	err := doctorCollection.FindOne(context.Background(), bson.M{"_id": docObjectID}).Decode(&doctor)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Doctor not found",
		})
		return
	}

	if !doctor.Available {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Doctor Not Available",
		})
		return
	}

	// Check slot availability
	if slots, exists := doctor.SlotsBooked[req.SlotDate]; exists {
		if utils.Contains(slots, req.SlotTime) {
			c.JSON(http.StatusBadRequest, models.APIResponse{
				Success: false,
				Message: "Slot Not Available",
			})
			return
		}
		doctor.SlotsBooked[req.SlotDate] = append(slots, req.SlotTime)
	} else {
		doctor.SlotsBooked[req.SlotDate] = []string{req.SlotTime}
	}

	// Get user data
	userCollection := config.GetCollection("users")
	var user models.User
	err = userCollection.FindOne(context.Background(), bson.M{"_id": userObjectID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	// Create appointment
	appointment := models.Appointment{
		UserID:   userID,
		DocID:    req.DocID,
		UserData: user,
		DocData:  doctor,
		Amount:   doctor.Fees,
		SlotTime: req.SlotTime,
		SlotDate: req.SlotDate,
		Date:     time.Now().Unix(),
	}

	appointmentCollection := config.GetCollection("appointments")
	_, err = appointmentCollection.InsertOne(context.Background(), appointment)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	// Update doctor's booked slots
	_, err = doctorCollection.UpdateOne(
		context.Background(),
		bson.M{"_id": docObjectID},
		bson.M{"$set": bson.M{"slots_booked": doctor.SlotsBooked}},
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
		Message: "Appointment Booked",
	})
}

// CancelAppointment cancels an appointment
func CancelAppointment(c *gin.Context) {
	userID := c.GetString("userId")
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

	// Verify appointment belongs to user
	if appointment.UserID != userID {
		c.JSON(http.StatusUnauthorized, models.APIResponse{
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

	// Release doctor slot
	docObjectID, _ := primitive.ObjectIDFromHex(appointment.DocID)
	doctorCollection := config.GetCollection("doctors")
	var doctor models.Doctor
	err = doctorCollection.FindOne(context.Background(), bson.M{"_id": docObjectID}).Decode(&doctor)
	if err == nil {
		if slots, exists := doctor.SlotsBooked[appointment.SlotDate]; exists {
			doctor.SlotsBooked[appointment.SlotDate] = utils.RemoveFromSlice(slots, appointment.SlotTime)
			doctorCollection.UpdateOne(
				context.Background(),
				bson.M{"_id": docObjectID},
				bson.M{"$set": bson.M{"slots_booked": doctor.SlotsBooked}},
			)
		}
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Appointment Cancelled",
	})
}

// ListAppointments gets user appointments
func ListAppointments(c *gin.Context) {
	userID := c.GetString("userId")

	appointmentCollection := config.GetCollection("appointments")
	cursor, err := appointmentCollection.Find(context.Background(), bson.M{"userId": userID})
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

// PaymentRazorpay creates Razorpay order
func PaymentRazorpay(c *gin.Context) {
	var req models.PaymentRequest
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
	if err != nil || appointment.Cancelled {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Appointment Cancelled or not found",
		})
		return
	}

	// Initialize Razorpay client
	client := razorpay.NewClient(os.Getenv("RAZORPAY_KEY_ID"), os.Getenv("RAZORPAY_KEY_SECRET"))

	// Create order
	data := map[string]interface{}{
		"amount":   int(appointment.Amount * 100), // Amount in paise
		"currency": os.Getenv("CURRENCY"),
		"receipt":  req.AppointmentID,
	}

	order, err := client.Order.Create(data, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    order,
	})
}

// VerifyRazorpay verifies Razorpay payment
func VerifyRazorpay(c *gin.Context) {
	var req models.VerifyPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Missing Details",
		})
		return
	}

	// Initialize Razorpay client
	client := razorpay.NewClient(os.Getenv("RAZORPAY_KEY_ID"), os.Getenv("RAZORPAY_KEY_SECRET"))

	// Fetch order info
	order, err := client.Order.Fetch(req.RazorpayOrderID, nil, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	if order["status"] == "paid" {
		appointmentObjectID, _ := primitive.ObjectIDFromHex(order["receipt"].(string))
		appointmentCollection := config.GetCollection("appointments")
		_, err = appointmentCollection.UpdateOne(
			context.Background(),
			bson.M{"_id": appointmentObjectID},
			bson.M{"$set": bson.M{"payment": true}},
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
			Message: "Payment Successful",
		})
	} else {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Payment Failed",
		})
	}
}

// PaymentStripe creates Stripe checkout session
func PaymentStripe(c *gin.Context) {
	var req models.PaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Missing Details",
		})
		return
	}

	appointmentObjectID, _ := primitive.ObjectIDFromHex(req.AppointmentID)
	origin := c.GetHeader("origin")

	// Get appointment data
	appointmentCollection := config.GetCollection("appointments")
	var appointment models.Appointment
	err := appointmentCollection.FindOne(context.Background(), bson.M{"_id": appointmentObjectID}).Decode(&appointment)
	if err != nil || appointment.Cancelled {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Appointment Cancelled or not found",
		})
		return
	}

	// Set Stripe secret key
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

	params := &stripe.CheckoutSessionParams{
		PaymentMethodTypes: stripe.StringSlice([]string{"card"}),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency: stripe.String(os.Getenv("CURRENCY")),
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name: stripe.String("Appointment Fees"),
					},
					UnitAmount: stripe.Int64(int64(appointment.Amount * 100)),
				},
				Quantity: stripe.Int64(1),
			},
		},
		Mode:       stripe.String(string(stripe.CheckoutSessionModePayment)),
		SuccessURL: stripe.String(fmt.Sprintf("%s/verify?success=true&appointmentId=%s", origin, req.AppointmentID)),
		CancelURL:  stripe.String(fmt.Sprintf("%s/verify?success=false&appointmentId=%s", origin, req.AppointmentID)),
	}

	sess, err := session.New(params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    map[string]string{"session_url": sess.URL},
	})
}

// VerifyStripe verifies Stripe payment
func VerifyStripe(c *gin.Context) {
	var req models.VerifyPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Missing Details",
		})
		return
	}

	if req.Success == "true" {
		appointmentObjectID, _ := primitive.ObjectIDFromHex(req.AppointmentID)
		appointmentCollection := config.GetCollection("appointments")
		_, err := appointmentCollection.UpdateOne(
			context.Background(),
			bson.M{"_id": appointmentObjectID},
			bson.M{"$set": bson.M{"payment": true}},
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
			Message: "Payment Successful",
		})
	} else {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Payment Failed",
		})
	}
}