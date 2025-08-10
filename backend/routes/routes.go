package routes

import (
	"github.com/gin-gonic/gin"
	"prescripto-go/controllers"
	"prescripto-go/middleware"
)

// UserRoutes defines all user-related routes
func UserRoutes(router *gin.RouterGroup) {
	router.POST("/register", controllers.RegisterUser)
	router.POST("/login", controllers.LoginUser)

	// Protected routes
	protected := router.Group("/")
	protected.Use(middleware.AuthUser())
	{
		protected.GET("/get-profile", controllers.GetProfile)
		protected.POST("/update-profile", middleware.FileUpload(), controllers.UpdateProfile)
		protected.POST("/book-appointment", controllers.BookAppointment)
		protected.GET("/appointments", controllers.ListAppointments)
		protected.POST("/cancel-appointment", controllers.CancelAppointment)
		protected.POST("/payment-razorpay", controllers.PaymentRazorpay)
		protected.POST("/verifyRazorpay", controllers.VerifyRazorpay)
		protected.POST("/payment-stripe", controllers.PaymentStripe)
		protected.POST("/verifyStripe", controllers.VerifyStripe)
	}
}

// DoctorRoutes defines all doctor-related routes
func DoctorRoutes(router *gin.RouterGroup) {
	router.POST("/login", controllers.LoginDoctor)
	router.GET("/list", controllers.GetDoctorList)

	// Protected routes
	protected := router.Group("/")
	protected.Use(middleware.AuthDoctor())
	{
		protected.POST("/cancel-appointment", controllers.CancelDoctorAppointment)
		protected.GET("/appointments", controllers.GetDoctorAppointments)
		protected.POST("/change-availability", controllers.ChangeAvailability)
		protected.POST("/complete-appointment", controllers.CompleteAppointment)
		protected.GET("/dashboard", controllers.GetDoctorDashboard)
		protected.GET("/profile", controllers.GetDoctorProfile)
		protected.POST("/update-profile", controllers.UpdateDoctorProfile)
	}
}

// AdminRoutes defines all admin-related routes
func AdminRoutes(router *gin.RouterGroup) {
	router.POST("/login", controllers.LoginAdmin)

	// Protected routes
	protected := router.Group("/")
	protected.Use(middleware.AuthAdmin())
	{
		protected.POST("/add-doctor", middleware.FileUpload(), controllers.AddDoctor)
		protected.GET("/appointments", controllers.GetAllAppointments)
		protected.POST("/cancel-appointment", controllers.CancelAppointmentAdmin)
		protected.GET("/all-doctors", controllers.GetAllDoctors)
		protected.POST("/change-availability", controllers.ChangeAvailability)
		protected.GET("/dashboard", controllers.GetAdminDashboard)
	}
}