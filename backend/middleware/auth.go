package middleware

import (
	"net/http"
	"os"
	// "strings"  // REMOVE THIS - not used

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"prescripto-go/models"
)

// AuthUser middleware for user authentication
func AuthUser() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		token := c.GetHeader("token")
		if token == "" {
			c.JSON(http.StatusUnauthorized, models.APIResponse{
				Success: false,
				Message: "Not Authorized Login Again",
			})
			c.Abort()
			return
		}

		claims := jwt.MapClaims{}
		parsedToken, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil || !parsedToken.Valid {
			c.JSON(http.StatusUnauthorized, models.APIResponse{
				Success: false,
				Message: "Not Authorized Login Again",
			})
			c.Abort()
			return
		}

		userID, ok := claims["id"].(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, models.APIResponse{
				Success: false,
				Message: "Invalid token",
			})
			c.Abort()
			return
		}

		c.Set("userId", userID)
		c.Next()
	})
}

// AuthDoctor middleware for doctor authentication
func AuthDoctor() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		token := c.GetHeader("dtoken")
		if token == "" {
			c.JSON(http.StatusUnauthorized, models.APIResponse{
				Success: false,
				Message: "Not Authorized Login Again",
			})
			c.Abort()
			return
		}

		claims := jwt.MapClaims{}
		parsedToken, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil || !parsedToken.Valid {
			c.JSON(http.StatusUnauthorized, models.APIResponse{
				Success: false,
				Message: "Not Authorized Login Again",
			})
			c.Abort()
			return
		}

		docID, ok := claims["id"].(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, models.APIResponse{
				Success: false,
				Message: "Invalid token",
			})
			c.Abort()
			return
		}

		c.Set("docId", docID)
		c.Next()
	})
}

// AuthAdmin middleware for admin authentication
func AuthAdmin() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		token := c.GetHeader("atoken")
		if token == "" {
			c.JSON(http.StatusUnauthorized, models.APIResponse{
				Success: false,
				Message: "Not Authorized Login Again",
			})
			c.Abort()
			return
		}

		claims := jwt.MapClaims{}
		parsedToken, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil || !parsedToken.Valid {
			c.JSON(http.StatusUnauthorized, models.APIResponse{
				Success: false,
				Message: "Not Authorized Login Again",
			})
			c.Abort()
			return
		}

		// Check if token payload matches admin credentials
		adminEmail := os.Getenv("ADMIN_EMAIL")
		adminPassword := os.Getenv("ADMIN_PASSWORD")
		expectedPayload := adminEmail + adminPassword

		if tokenStr, ok := claims["data"].(string); !ok || tokenStr != expectedPayload {
			c.JSON(http.StatusUnauthorized, models.APIResponse{
				Success: false,
				Message: "Not Authorized Login Again",
			})
			c.Abort()
			return
		}

		c.Next()
	})
}

// FileUpload middleware for handling file uploads
func FileUpload() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Set max memory for multipart forms (32 MB)
		c.Request.ParseMultipartForm(32 << 20)
		c.Next()
	})
}