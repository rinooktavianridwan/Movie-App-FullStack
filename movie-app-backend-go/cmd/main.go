package main

import (
	"fmt"
	"log"
	"movie-app-go/database"
	"movie-app-go/internal/jobs"
	"movie-app-go/internal/middleware"
	"os"

	"movie-app-go/database/seed"
	"movie-app-go/internal/models"
	"movie-app-go/internal/modules/genre"
	"movie-app-go/internal/modules/iam"
	"movie-app-go/internal/modules/movie"
	"movie-app-go/internal/modules/notification"
	"movie-app-go/internal/modules/order"
	"movie-app-go/internal/modules/promo"
	"movie-app-go/internal/modules/report"
	"movie-app-go/internal/modules/schedule"
	"movie-app-go/internal/modules/studio"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}

	db, err := database.ConnectDB()
	if err != nil {
		fmt.Println("Gagal koneksi ke database:", err)
		return
	}

	database.RunMigrations()

	var userCount int64
	db.Model(&models.User{}).Count(&userCount)
	if userCount == 0 {
		log.Println("Database kosong, menjalankan seeder...")
		if err := seed.RunAllSeeders(db); err != nil {
			log.Fatal("Gagal menjalankan seeder:", err)
		}
		log.Println("Seeding berhasil!")
	}

	queueService := jobs.NewQueueService(redisAddr)
	workerService := jobs.NewWorkerService(redisAddr, db)

	go func() {
		if err := workerService.Start(); err != nil {
			fmt.Printf("Could not start worker: %v\n", err)
		}
	}()

	// Jalankan seeder via argumen CLI
	if len(os.Args) > 1 && os.Args[1] == "seed" {
		if err := seed.RunAllSeeders(db); err != nil {
			fmt.Println("Gagal menjalankan seeder:", err)
		} else {
			fmt.Println("Seeding berhasil!")
		}
		return
	}

	// Dependency injection
	iamModule := iam.NewIAMModule(db)
	middlewareFactory := middleware.NewFactory()
	studioModule := studio.NewStudioModule(db)
	movieModule := movie.NewMovieModule(db)
	genreModule := genre.NewGenreModule(db)
	scheduleModule := schedule.NewScheduleModule(db)
	promoModule := promo.NewPromoModule(db)
	orderModule := order.NewOrderModule(db, queueService, promoModule.PromoService)
	notificationModule := notification.NewNotificationModule(db)
	reportModule := report.NewReportModule(db)
	tmdbModule := movie.NewTMDBModule(db)
	tmdbCron := jobs.NewTMDBCron(db)
	tmdbCron.Start()

	scheduleGeneratorCron := jobs.NewScheduleGeneratorCron(db)
	scheduleGeneratorCron.Start()

	// Setup Gin
	r := gin.Default()
	r.Use(middleware.CORSMiddleware())

	r.Static("/uploads", "./uploads")

	api := r.Group("/api")
	{
		iam.RegisterRoutes(api, iamModule, middlewareFactory)
		studio.RegisterRoutes(api, studioModule, middlewareFactory)
		movie.RegisterRoutes(api, movieModule, middlewareFactory)
		genre.RegisterRoutes(api, genreModule, middlewareFactory)
		schedule.RegisterRoutes(api, scheduleModule, middlewareFactory)
		promo.RegisterRoutes(api, promoModule, middlewareFactory)
		notification.RegisterRoutes(api, notificationModule, middlewareFactory)
		order.RegisterRoutes(api, orderModule, middlewareFactory)
		report.RegisterRoutes(api, reportModule, middlewareFactory)
		movie.RegisterTMDBRoutes(api, tmdbModule, middlewareFactory)
	}

	// Run server
	fmt.Printf("Server berjalan di port %s\n", port)
	r.Run(":" + port)
}
