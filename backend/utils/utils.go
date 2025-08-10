package utils

import (
	"context"
	"fmt"
	"mime/multipart"
	"os"
	"regexp"
	"time"

	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/dgrijalva/jwt-go"
	"golang.org/x/crypto/bcrypt"
	"prescripto-go/config"
)

// HashPassword hashes a password using bcrypt
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	return string(bytes), err
}

// CheckPasswordHash verifies a password against its hash
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateJWT generates a JWT token with the given payload
func GenerateJWT(payload interface{}) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":  payload,
		"exp": time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 days
		"iat": time.Now().Unix(),
	})

	return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}

// GenerateAdminJWT generates a JWT token for admin
func GenerateAdminJWT(data string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"data": data,
		"exp":  time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 days
		"iat":  time.Now().Unix(),
	})

	return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}

// IsValidEmail validates email format
func IsValidEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

// UploadToCloudinary uploads an image to Cloudinary
func UploadToCloudinary(file multipart.File, filename string) (string, error) {
	ctx := context.Background()
	
	uploadResult, err := config.Cloudinary.Upload.Upload(ctx, file, uploader.UploadParams{
		PublicID:     filename,
		ResourceType: "image",
	})
	
	if err != nil {
		return "", fmt.Errorf("failed to upload image: %v", err)
	}
	
	return uploadResult.SecureURL, nil
}

// Contains checks if a slice contains a specific string
func Contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// RemoveFromSlice removes an item from a string slice
func RemoveFromSlice(slice []string, item string) []string {
	result := make([]string, 0)
	for _, s := range slice {
		if s != item {
			result = append(result, s)
		}
	}
	return result
}

// ReverseSlice reverses a slice of appointments
func ReverseAppointments(appointments []interface{}) []interface{} {
	for i, j := 0, len(appointments)-1; i < j; i, j = i+1, j-1 {
		appointments[i], appointments[j] = appointments[j], appointments[i]
	}
	return appointments
}