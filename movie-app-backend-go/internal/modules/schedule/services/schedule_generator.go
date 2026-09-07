package services

import (
	"math/rand"
	"time"

	"movie-app-go/internal/models"
	movierepos "movie-app-go/internal/modules/movie/repositories"
	schedulerepos "movie-app-go/internal/modules/schedule/repositories"
	studiorepos "movie-app-go/internal/modules/studio/repositories"
)

type ScheduleGeneratorService struct {
	ScheduleRepo *schedulerepos.ScheduleRepository
	MovieRepo    *movierepos.MovieRepository
	StudioRepo   *studiorepos.StudioRepository
}

func NewScheduleGeneratorService(
	scheduleRepo *schedulerepos.ScheduleRepository,
	movieRepo *movierepos.MovieRepository,
	studioRepo *studiorepos.StudioRepository,
) *ScheduleGeneratorService {
	return &ScheduleGeneratorService{
		ScheduleRepo: scheduleRepo,
		MovieRepo:    movieRepo,
		StudioRepo:   studioRepo,
	}
}

type GenerateSchedulesOptions struct {
	DaysAhead   int
	MaxMovies   int
	OpenHour    int
	CloseHour   int
	BufferMins  int
	MinPrice    float64
	MaxPrice    float64
}

type GenerateSchedulesResult struct {
	Created          int
	Skipped          int
	MoviesProcessed  int
	DaysCovered      int
	StudiosUsed      int
	Errors           []string
}

func (s *ScheduleGeneratorService) GenerateSchedules(opts GenerateSchedulesOptions) (*GenerateSchedulesResult, error) {
	if opts.DaysAhead <= 0 {
		opts.DaysAhead = 2
	}
	if opts.MaxMovies <= 0 {
		opts.MaxMovies = 20
	}
	if opts.OpenHour <= 0 {
		opts.OpenHour = 10
	}
	if opts.CloseHour <= 0 {
		opts.CloseHour = 23
	}
	if opts.BufferMins <= 0 {
		opts.BufferMins = 30
	}
	if opts.MinPrice <= 0 {
		opts.MinPrice = 25000
	}
	if opts.MaxPrice <= 0 {
		opts.MaxPrice = 100000
	}

	movies, err := s.MovieRepo.GetLatestMovies(opts.MaxMovies)
	if err != nil {
		return nil, err
	}

	if len(movies) == 0 {
		return &GenerateSchedulesResult{
			Created:          0,
			Skipped:          0,
			MoviesProcessed:  0,
			DaysCovered:      opts.DaysAhead,
			StudiosUsed:      0,
			Errors:           []string{"no movies found"},
		}, nil
	}

	studios, err := s.StudioRepo.GetAll()
	if err != nil {
		return nil, err
	}

	if len(studios) == 0 {
		return &GenerateSchedulesResult{
			Created:          0,
			Skipped:          0,
			MoviesProcessed:  len(movies),
			DaysCovered:      opts.DaysAhead,
			StudiosUsed:      0,
			Errors:           []string{"no studios found"},
		}, nil
	}

	result := &GenerateSchedulesResult{
		Created:          0,
		Skipped:          0,
		MoviesProcessed:  len(movies),
		DaysCovered:      opts.DaysAhead,
		StudiosUsed:      len(studios),
		Errors:           []string{},
	}

	today := time.Now().Truncate(24 * time.Hour)

	for dayOffset := 0; dayOffset < opts.DaysAhead; dayOffset++ {
		currentDate := today.AddDate(0, 0, dayOffset)
		dateStr := currentDate.Format("2006-01-02")

		for _, studio := range studios {
			currentTime := time.Date(
				currentDate.Year(), currentDate.Month(), currentDate.Day(),
				opts.OpenHour, 0, 0, 0, currentDate.Location(),
			)
			closeTime := time.Date(
				currentDate.Year(), currentDate.Month(), currentDate.Day(),
				opts.CloseHour, 0, 0, 0, currentDate.Location(),
			)

			movieIndex := 0
			for currentTime.Before(closeTime) && movieIndex < len(movies) {
				movie := movies[movieIndex]
				slotDuration := time.Duration(movie.Duration+uint(opts.BufferMins)) * time.Minute
				endTime := currentTime.Add(slotDuration)

				if endTime.After(closeTime) {
					break
				}

				exists, err := s.ScheduleRepo.ExistsForMovieStudioDateTime(movie.ID, studio.ID, dateStr, currentTime.Format("15:04:05"))
				if err != nil {
					result.Errors = append(result.Errors, err.Error())
					movieIndex++
					continue
				}

				if exists {
					result.Skipped++
					movieIndex++
					continue
				}

				price := opts.MinPrice + rand.Float64()*(opts.MaxPrice-opts.MinPrice)

				schedule := &models.Schedule{
					MovieID:   movie.ID,
					StudioID:  studio.ID,
					StartTime: currentTime,
					EndTime:   endTime,
					Date:      currentDate,
					Price:     price,
				}

				err = s.ScheduleRepo.Create(schedule)
				if err != nil {
					result.Errors = append(result.Errors, err.Error())
				} else {
					result.Created++
				}

				movieIndex++
				currentTime = endTime.Add(time.Duration(opts.BufferMins) * time.Minute)
			}
		}
	}

	return result, nil
}