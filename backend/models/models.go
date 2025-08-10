package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// User model
type User struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name     string             `bson:"name" json:"name" binding:"required"`
	Email    string             `bson:"email" json:"email" binding:"required,email"`
	Password string             `bson:"password" json:"-" binding:"required,min=8"`
	Image    string             `bson:"image" json:"image"`
	Phone    string             `bson:"phone" json:"phone"`
	Address  Address            `bson:"address" json:"address"`
	Gender   string             `bson:"gender" json:"gender"`
	DOB      string             `bson:"dob" json:"dob"`
}

// Doctor model
type Doctor struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name        string             `bson:"name" json:"name" binding:"required"`
	Email       string             `bson:"email" json:"email" binding:"required,email"`
	Password    string             `bson:"password" json:"-" binding:"required,min=8"`
	Image       string             `bson:"image" json:"image" binding:"required"`
	Speciality  string             `bson:"speciality" json:"speciality" binding:"required"`
	Degree      string             `bson:"degree" json:"degree" binding:"required"`
	Experience  string             `bson:"experience" json:"experience" binding:"required"`
	About       string             `bson:"about" json:"about" binding:"required"`
	Available   bool               `bson:"available" json:"available"`
	Fees        float64            `bson:"fees" json:"fees" binding:"required"`
	SlotsBooked map[string][]string `bson:"slots_booked" json:"slots_booked"`
	Address     Address            `bson:"address" json:"address" binding:"required"`
	Date        int64              `bson:"date" json:"date"`
}

// Appointment model
type Appointment struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      string             `bson:"userId" json:"userId" binding:"required"`
	DocID       string             `bson:"docId" json:"docId" binding:"required"`
	SlotDate    string             `bson:"slotDate" json:"slotDate" binding:"required"`
	SlotTime    string             `bson:"slotTime" json:"slotTime" binding:"required"`
	UserData    User               `bson:"userData" json:"userData"`
	DocData     Doctor             `bson:"docData" json:"docData"`
	Amount      float64            `bson:"amount" json:"amount" binding:"required"`
	Date        int64              `bson:"date" json:"date"`
	Cancelled   bool               `bson:"cancelled" json:"cancelled"`
	Payment     bool               `bson:"payment" json:"payment"`
	IsCompleted bool               `bson:"isCompleted" json:"isCompleted"`
}

// Address embedded document
type Address struct {
	Line1 string `bson:"line1" json:"line1"`
	Line2 string `bson:"line2" json:"line2"`
}

// Request/Response DTOs
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type UpdateProfileRequest struct {
	Name    string  `json:"name" binding:"required"`
	Phone   string  `json:"phone" binding:"required"`
	Address Address `json:"address"`
	DOB     string  `json:"dob" binding:"required"`
	Gender  string  `json:"gender" binding:"required"`
}

type BookAppointmentRequest struct {
	DocID    string `json:"docId" binding:"required"`
	SlotDate string `json:"slotDate" binding:"required"`
	SlotTime string `json:"slotTime" binding:"required"`
}

type CancelAppointmentRequest struct {
	AppointmentID string `json:"appointmentId" binding:"required"`
}

type AddDoctorRequest struct {
	Name       string  `json:"name" binding:"required"`
	Email      string  `json:"email" binding:"required,email"`
	Password   string  `json:"password" binding:"required,min=8"`
	Speciality string  `json:"speciality" binding:"required"`
	Degree     string  `json:"degree" binding:"required"`
	Experience string  `json:"experience" binding:"required"`
	About      string  `json:"about" binding:"required"`
	Fees       float64 `json:"fees" binding:"required"`
	Address    Address `json:"address" binding:"required"`
}

type UpdateDoctorProfileRequest struct {
	Fees      float64 `json:"fees"`
	Address   Address `json:"address"`
	Available bool    `json:"available"`
}

type ChangeAvailabilityRequest struct {
	DocID string `json:"docId" binding:"required"`
}

type PaymentRequest struct {
	AppointmentID string `json:"appointmentId" binding:"required"`
}

type VerifyPaymentRequest struct {
	RazorpayOrderID string `json:"razorpay_order_id"`
	AppointmentID   string `json:"appointmentId"`
	Success         string `json:"success"`
}

// Response structures
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Token   string      `json:"token,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

type DashboardData struct {
	Doctors             int           `json:"doctors"`
	Appointments        int           `json:"appointments"`
	Patients            int           `json:"patients"`
	Earnings            float64       `json:"earnings,omitempty"`
	LatestAppointments  []Appointment `json:"latestAppointments"`
}

// Default values for User model
func NewUser() *User {
	return &User{
		Image:   "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAADwCAYAAAA+VemSAAAACXBIWXMAABCcAAAQnAEmzTo0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAA5uSURBVHgB7d0JchvHFcbxN+C+iaQolmzFsaWqHMA5QXID+wZJTmDnBLZu4BvER4hvYJ/AvoHlimPZRUngvoAg4PkwGJOiuGCd6df9/1UhoJZYJIBvXndPL5ndofljd8NW7bP8y79bZk+tmz8ATFdmu3nWfuiYfdNo2383389e3P5Xb9B82X1qs/YfU3AB1Cuzr+3cnt8U5Mb132i+7n5mc/a9EV4gDF37Z15Qv3/9a/fz63/0VgXOw/uFdexLAxCqLze3s+flL/4IcK/yduwrAxC0zoX9e+u9rJfVXoB7fV41m7u2YQBCt2tt+6v6xEUfeM6+ILyAGxv9QWbL+iPOPxoAX2Zts9GZtU8NgDudln3eyNvQnxgAd/Lw/k194I8NgD+ZPc2aO92uAXCpYQDcIsCAYwQYcIwAA44RYMAxAgw4RoABxwgw4BgBBhwjwIBjBBhwjAADjhFgwDECDDhGgAHHCDDgGAEGHCPAgGMEGHCMAAOOEWDAMQIMOEaAAccIMOAYAQYcI8CAYwQYcIwAA44RYMAxAgw4RoABxwgw4BgBBhwjwIBjBBhwjAADjhFgwDECDDhGgAHHCDDgGAEGHCPAgGMEGHCMAAOOEWDAMQIMOEaAAccIMOAYAQYcI8CAYwQYcIwAA44RYMAxAgw4RoABxwgw4BgBBhwjwIBjBBhwjAADjhFgwDECDDhGgAHHCDDgGAEGHCPAgGMEGHCMAAOOEWDAMQIMOEaAAccIMOAYAQYcI8CAYwQYcIwAA44RYMAxAgw4RoABxwgw4BgBBhwjwIBjBBhwjAADjhFgwDECDDhGgAHHCDDgGAEGHCPAgGMEGHCMAAOOEWDAMQIMOEaAAccIMOAYAQYcI8CAYwQYcIwAA44RYMAxAgw4RoABxwgw4BgBBhwjwIBjBBhwjAADjhFgwDECDDhGgAHHCDDgGAEGHCPAgGMEGHCMAAOOEWDAMQIMOEaAAccIMOAYAQYcI8CAYwQYcIwAA44RYMAxAgw4RoABxwgw4BgBBhwjwIBjBBhwjAADjhFgwDECDDhGgAHHCDDgGAEGHCPAgGMEGHCMAAOOEWDAMQIMOEaAAccIMOAYAQYcI8CAYwQYcIwAA44RYMAxAgw4RoABxwgw4BgBBhwjwIBjBBhwjAADjhFgwDECDDhGgAHHCDDgGAEGHCPAgGMEGHCMAAOOEWDAMQIMOEaAAccIMOAYAQYcI8CAYwQYcIwAA44RYMAxAgw4RoABxwgw4BgBBhwjwIBjBBhwjAADjhFgwDECDDhGgAHHCDDgGAEGHCPAgGMEGHCMAAOOEWDAMQIMOEaAAccIMOAYAQYcI8CAYwQYcIwAA44RYMAxAgw4RoABxwgw4BgBBhwjwIBjBBhwjAADjhFgwDECDDhGgAHHCDDgGAEGHCPAgGMEGHCMAAOOEWDAMQIMOEaAAccIMOAYAQYcI8CAYwQYcIwAA44RYMAxAgw4RoABxwgw4BgBBhwjwIBjBBhwjAADjhFgwDECDDhGgAHHCDDgGAEGHCPAgGMEGHCMAAOOEWDAMQIMOEaAAccIMOAYAQYcI8CAYwQYcIwAA44RYMAxAgw4RoABxwgw4BgBBhwjwIBjBBhwjAADjhFgwDECDDhGgAHHCDDgGAEGHCPAgGMEGHCMAAOOEWDAMQIMOEaAAccIMOAYAQYcI8CAYwQYcIwAA44RYMAxAgw4RoABxwgw4BgBBhwjwIBjBBhwjAADjhFgwDECDDhGgAHHCDDgGAEGHCPAgGMEGHCMAAOOEWDAMQIMOEaAAccIMOAYAQYcI8CAYwQYcIwAA44RYMAxAg" +
			"w4RoABxwgw4BgBBhwjwIBjBBhwjAADjhFgwDECDDhGgAHHCDDgGAEGHCPAgGMEGHCMAAOOEWDAMQIMOEaAAccIMOAYAQYcI8CAYwQYcIwAA44RYMAxAgw4RoABxwgw4BgBBhwjwIBjBBhwjAADjhFgwDECDDhGgAHHCDDgGAEGHCPAgGMEGHCMAAOOEWDAMQIMOEaAAccIMOAYAQYcI8CAYwQYcIwAA44RYMAxAgw4RoABxwgw4BgBBhwjwIBjBBhwjAADjhFgwDECDDhGgAHHCDDgGAEGHCPAgGMEGHCMAAOOEWDAMQIMOEaAAccIMOAYAQYcI8CAYwQYcIwAA44RYMAxAgw4RoABxwgw4BgBBhwjwIBjBBhwjAADjhFgwDECDDhGgAHHCDDgGAEGHCPAgGMEGHCMAAOOEWDAMQIMOEaAAccIMOAYAQYcI8CAYwQYcIwAA44RYMAxAgw4RoABxwgw4BgBBhwjwIBjBBhwjAADjhFgwDECDDhGgAHHCDDgGAEGHCPAgGMEGHCMAAOOEWDAMQIMOEaAAccIMOAYAQYcI8CAYwQYcIwAA44RYMAxAgw4RoABxwgw4BgBBh",
		Phone:   "000000000",
		Address: Address{Line1: "", Line2: ""},
		Gender:  "Not Selected",
		DOB:     "Not Selected",
	}
}

func NewDoctor() *Doctor {
	return &Doctor{
		Available:   true,
		SlotsBooked: make(map[string][]string),
		Date:        time.Now().Unix(),
	}
}