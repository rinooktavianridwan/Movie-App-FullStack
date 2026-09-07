package jobs

import (
	"fmt"
	"movie-app-go/internal/modules/schedule/repositories"
	"movie-app-go/internal/modules/schedule/services"
	movierepos "movie-app-go/internal/modules/movie/repositories"
	studiorepos "movie-app-go/internal/modules/studio/repositories"

	"gorm.io/gorm"
	"github.com/robfig/cron/v3"
)

type ScheduleGeneratorCron struct {
	DB   *gorm.DB
	Cron *cron.Cron
}

func NewScheduleGeneratorCron(db *gorm.DB) *ScheduleGeneratorCron {
	return &ScheduleGeneratorCron{
		DB:   db,
		Cron: cron.New(),
	}
}

func (j *ScheduleGeneratorCron) Start() {
	j.Cron.AddFunc("0 7 * * *", func() {
		fmt.Println("[CRON] Starting schedule generation for latest movies...")
		
		scheduleRepo := repositories.NewScheduleRepository(j.DB)
		movieRepo := movierepos.NewMovieRepository(j.DB)
		studioRepo := studiorepos.NewStudioRepository(j.DB)
		
		svc := services.NewScheduleGeneratorService(scheduleRepo, movieRepo, studioRepo)
		result, err := svc.GenerateSchedules(services.GenerateSchedulesOptions{
			DaysAhead:  2,
			MaxMovies:  20,
			OpenHour:   10,
			CloseHour:  23,
			BufferMins: 30,
			MinPrice:   25000,
			MaxPrice:   100000,
		})
		if err != nil {
			fmt.Printf("[CRON] Schedule generation error: %v\n", err)
			return
		}
		fmt.Printf("[CRON] Schedule generation complete: created=%d, skipped=%d, movies_processed=%d, days_covered=%d, studios_used=%d\n",
			result.Created, result.Skipped, result.MoviesProcessed, result.DaysCovered, result.StudiosUsed)
		if len(result.Errors) > 0 {
			for _, e := range result.Errors {
				fmt.Printf("[CRON] Error: %s\n", e)
			}
		}
	})
	j.Cron.Start()
}

func (j *ScheduleGeneratorCron) Stop() {
	j.Cron.Stop()
}