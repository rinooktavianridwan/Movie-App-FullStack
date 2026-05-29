package jobs

import (
	"fmt"
	"movie-app-go/internal/modules/movie/services"

	"gorm.io/gorm"
	"github.com/robfig/cron/v3"
)

type TMDBCron struct {
	DB *gorm.DB
	Cron *cron.Cron
}

func NewTMDBCron(db *gorm.DB) *TMDBCron {
	return &TMDBCron{
		DB: db,
		Cron: cron.New(),
	}
}

func (j *TMDBCron) Start() {
	j.Cron.AddFunc("0 6 * * *", func() {
		fmt.Println("[CRON] Fetching movies from TMDB...")
		service := services.NewTMDBService(j.DB)
		if err := service.FetchNowPlaying(); err != nil {
			fmt.Println("[CRON] TMDB fetch error:", err)
		} else {
			fmt.Println("[CRON] TMDB fetch success")
		}
	})
	j.Cron.Start()
}

func (j *TMDBCron) Stop() {
	j.Cron.Stop()
}
