package seed

import (
	"log"
	"movie-app-go/internal/models"
	"time"

	"gorm.io/gorm"
)

func SeedSchedules(db *gorm.DB) ([]models.Schedule, error) {
	log.Println("Seeding schedules...")

	// Get movies and studios for relationships
	var movies []models.Movie
	var studios []models.Studio

	if err := db.Find(&movies).Error; err != nil {
		return nil, err
	}
	if err := db.Find(&studios).Error; err != nil {
		return nil, err
	}

	if len(movies) == 0 || len(studios) == 0 {
		log.Println("No movies or studios found, skipping schedule seeding")
		return []models.Schedule{}, nil
	}

	today := time.Now().Truncate(24 * time.Hour)

	day := func(offset int) time.Time {
		return today.AddDate(0, 0, offset)
	}
	at := func(offset, hour, minute int) time.Time {
		return day(offset).Add(time.Duration(hour)*time.Hour + time.Duration(minute)*time.Minute)
	}
	movie := func(i int) uint {
		return movies[i%len(movies)].ID
	}
	studio := func(i int) uint {
		return studios[i%len(studios)].ID
	}

	schedules := []models.Schedule{
		// Day 0 (today) — 3 studios, 2 time slots each, no overlaps
		{MovieID: movie(0), StudioID: studio(0), StartTime: at(0, 10, 0), EndTime: at(0, 13, 0), Date: day(0), Price: 75000},
		{MovieID: movie(1), StudioID: studio(1), StartTime: at(0, 10, 0), EndTime: at(0, 13, 0), Date: day(0), Price: 80000},
		{MovieID: movie(2), StudioID: studio(2), StartTime: at(0, 10, 0), EndTime: at(0, 13, 0), Date: day(0), Price: 85000},
		{MovieID: movie(3), StudioID: studio(0), StartTime: at(0, 14, 0), EndTime: at(0, 17, 0), Date: day(0), Price: 90000},
		{MovieID: movie(0), StudioID: studio(1), StartTime: at(0, 14, 0), EndTime: at(0, 17, 0), Date: day(0), Price: 75000},
		{MovieID: movie(1), StudioID: studio(2), StartTime: at(0, 14, 0), EndTime: at(0, 17, 0), Date: day(0), Price: 80000},

		// Day 1 (tomorrow)
		{MovieID: movie(2), StudioID: studio(0), StartTime: at(1, 10, 0), EndTime: at(1, 13, 0), Date: day(1), Price: 85000},
		{MovieID: movie(3), StudioID: studio(1), StartTime: at(1, 10, 0), EndTime: at(1, 13, 0), Date: day(1), Price: 90000},
		{MovieID: movie(0), StudioID: studio(2), StartTime: at(1, 10, 0), EndTime: at(1, 13, 0), Date: day(1), Price: 75000},
		{MovieID: movie(1), StudioID: studio(0), StartTime: at(1, 14, 0), EndTime: at(1, 17, 0), Date: day(1), Price: 80000},
		{MovieID: movie(2), StudioID: studio(1), StartTime: at(1, 14, 0), EndTime: at(1, 17, 0), Date: day(1), Price: 85000},
		{MovieID: movie(3), StudioID: studio(2), StartTime: at(1, 14, 0), EndTime: at(1, 17, 0), Date: day(1), Price: 90000},
	}

	// Check existing schedules to avoid duplicates
	for _, schedule := range schedules {
		var existing models.Schedule
		err := db.Where("movie_id = ? AND studio_id = ? AND start_time = ?",
			schedule.MovieID, schedule.StudioID, schedule.StartTime).First(&existing).Error

		if err == gorm.ErrRecordNotFound {
			if err := db.Create(&schedule).Error; err != nil {
				return nil, err
			}
		}
	}

	// Return created schedules
	var createdSchedules []models.Schedule
	if err := db.Find(&createdSchedules).Error; err != nil {
		return nil, err
	}

	log.Printf("Successfully seeded %d schedules", len(createdSchedules))
	return createdSchedules, nil
}
