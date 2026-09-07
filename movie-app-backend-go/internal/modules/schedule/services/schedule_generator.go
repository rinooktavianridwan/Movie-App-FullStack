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
	DaysAhead  int
	MaxMovies  int
	OpenHour   int
	CloseHour  int
	BufferMins int
	MinPrice   float64
	MaxPrice   float64
}

type GenerateSchedulesResult struct {
	Created         int      `json:"created"`
	Skipped         int      `json:"skipped"`
	MoviesProcessed int      `json:"movies_processed"`
	DaysCovered     int      `json:"days_covered"`
	StudiosUsed     int      `json:"studios_used"`
	DateFrom        string   `json:"date_from"`
	DateTo          string   `json:"date_to"`
	Errors          []string `json:"errors"`
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

	if opts.OpenHour > 23 {
		opts.OpenHour = 10
	}
	if opts.CloseHour > 24 {
		opts.CloseHour = 24
	}
	if opts.CloseHour <= opts.OpenHour {
		opts.CloseHour = opts.OpenHour + 1
		if opts.CloseHour > 24 {
			opts.CloseHour = 24
		}
	}

	movies, err := s.MovieRepo.GetLatestMovies(opts.MaxMovies)
	if err != nil {
		return nil, err
	}

	if len(movies) == 0 {
		return &GenerateSchedulesResult{
			Created:         0,
			Skipped:         0,
			MoviesProcessed: 0,
			DaysCovered:     opts.DaysAhead,
			StudiosUsed:     0,
			Errors:          []string{"no movies found"},
		}, nil
	}

	studios, err := s.StudioRepo.GetAll()
	if err != nil {
		return nil, err
	}

	if len(studios) == 0 {
		return &GenerateSchedulesResult{
			Created:         0,
			Skipped:         0,
			MoviesProcessed: len(movies),
			DaysCovered:     opts.DaysAhead,
			StudiosUsed:     0,
			Errors:          []string{"no studios found"},
		}, nil
	}

	result := &GenerateSchedulesResult{
		Created:         0,
		Skipped:         0,
		MoviesProcessed: len(movies),
		DaysCovered:     opts.DaysAhead,
		StudiosUsed:     len(studios),
		Errors:          []string{},
	}

	now := time.Now()
	startDate := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	endDate := startDate.AddDate(0, 0, opts.DaysAhead-1)
	result.DateFrom = startDate.Format("2006-01-02")
	result.DateTo = endDate.Format("2006-01-02")

	buffer := time.Duration(opts.BufferMins) * time.Minute

	for dayOffset := 0; dayOffset < opts.DaysAhead; dayOffset++ {
		currentDate := startDate.AddDate(0, 0, dayOffset)

		for _, studio := range studios {
			currentTime := time.Date(
				currentDate.Year(), currentDate.Month(), currentDate.Day(),
				opts.OpenHour, 0, 0, 0, currentDate.Location(),
			)
			closeTime := time.Date(
				currentDate.Year(), currentDate.Month(), currentDate.Day(),
				opts.CloseHour, 0, 0, 0, currentDate.Location(),
			)

			for movieIndex := 0; movieIndex < len(movies); {
				movie := movies[movieIndex]
				slotDuration := time.Duration(movie.Duration)*time.Minute + buffer
				endTime := currentTime.Add(slotDuration)

				if endTime.After(closeTime) {
					break
				}

				blocker, err := s.ScheduleRepo.FindFirstConflict(studio.ID, currentDate, currentTime, endTime)
				if err != nil {
					result.Errors = append(result.Errors, err.Error())
					movieIndex++
					continue
				}

				if blocker != nil {
					result.Skipped++
					nextStart := blocker.EndTime.Add(buffer)
					if !nextStart.After(currentTime) {
						nextStart = currentTime.Add(buffer)
					}
					currentTime = nextStart
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
					movieIndex++
					continue
				}

				result.Created++
				movieIndex++
				currentTime = endTime
			}
		}
	}

	return result, nil
}
