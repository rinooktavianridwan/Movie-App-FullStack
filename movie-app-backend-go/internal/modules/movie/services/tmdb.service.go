package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"movie-app-go/internal/models"
	"net/http"
	"os"
	"time"

	"gorm.io/gorm"
)

type TMDBService struct {
	DB *gorm.DB
}

type tmdbMovie struct {
	ID          int      `json:"id"`
	Title       string   `json:"title"`
	Overview    string   `json:"overview"`
	PosterPath  string   `json:"poster_path"`
	ReleaseDate string   `json:"release_date"`
	GenreIDs    []int    `json:"genre_ids"`
	Runtime     int      `json:"runtime"`
}

type tmdbMovieResp struct {
	Results []tmdbMovie `json:"results"`
}

type tmdbGenre struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type tmdbGenreResp struct {
	Genres []tmdbGenre `json:"genres"`
}

type tmdbMovieDetail struct {
	Runtime int `json:"runtime"`
}

func NewTMDBService(db *gorm.DB) *TMDBService {
	return &TMDBService{DB: db}
}

func (s *TMDBService) FetchNowPlaying() error {
	token := os.Getenv("TMDB_READ_ACCESS_TOKEN")
	if token == "" {
		return errors.New("TMDB_READ_ACCESS_TOKEN not set")
	}
	baseUrl := "https://api.themoviedb.org/3"
	client := &http.Client{Timeout: 15 * time.Second}

	// Fetch genres
	genreReq, _ := http.NewRequest("GET", baseUrl+"/genre/movie/list", nil)
	genreReq.Header.Set("Authorization", "Bearer "+token)
	genreReq.Header.Set("accept", "application/json")
	genreResp, err := client.Do(genreReq)
	if err != nil {
		return err
	}
	defer genreResp.Body.Close()
	var genreData tmdbGenreResp
	if err := json.NewDecoder(genreResp.Body).Decode(&genreData); err != nil {
		return err
	}
	genreMap := map[int]string{}
	for _, g := range genreData.Genres {
		genreMap[g.ID] = g.Name
	}

	// Fetch now playing
	movieReq, _ := http.NewRequest("GET", baseUrl+"/movie/now_playing", nil)
	movieReq.Header.Set("Authorization", "Bearer "+token)
	movieReq.Header.Set("accept", "application/json")
	q := movieReq.URL.Query()
	q.Add("language", "en-US")
	q.Add("page", "1")
	q.Add("region", "US")
	movieReq.URL.RawQuery = q.Encode()
	movieResp, err := client.Do(movieReq)
	if err != nil {
		return err
	}
	defer movieResp.Body.Close()
	var movieData tmdbMovieResp
	if err := json.NewDecoder(movieResp.Body).Decode(&movieData); err != nil {
		return err
	}

	for i := range movieData.Results {
		m := &movieData.Results[i]

		if m.Runtime == 0 {
			detailReq, _ := http.NewRequest("GET", fmt.Sprintf("%s/movie/%d", baseUrl, m.ID), nil)
			detailReq.Header.Set("Authorization", "Bearer "+token)
			detailReq.Header.Set("accept", "application/json")
			detailResp, err := client.Do(detailReq)
			if err == nil {
				var detail tmdbMovieDetail
				if json.NewDecoder(detailResp.Body).Decode(&detail) == nil {
					m.Runtime = detail.Runtime
				}
				detailResp.Body.Close()
			}
		}

		var duration uint
		if m.Runtime > 0 {
			duration = uint(m.Runtime)
		}
		poster := ""
		if m.PosterPath != "" {
			poster = "https://image.tmdb.org/t/p/w500" + m.PosterPath
		}
		// Find or create genres
		var genreIDs []uint
		for _, gid := range m.GenreIDs {
			gName, ok := genreMap[gid]
			if !ok {
				continue
			}
			var genre models.Genre
			err := s.DB.Where("name = ?", gName).FirstOrCreate(&genre, models.Genre{Name: gName}).Error
			if err != nil {
				return err
			}
			genreIDs = append(genreIDs, genre.ID)
		}

		err = s.DB.Transaction(func(tx *gorm.DB) error {
			var existing models.Movie
			result := tx.Where("title = ?", m.Title).First(&existing)
			if result.Error == nil {
				existing.Duration = duration
				if poster != "" {
					existing.PosterURL = &poster
				}
				return tx.Save(&existing).Error
			}

			movie := models.Movie{
				Title:    m.Title,
				Overview: m.Overview,
				Duration: duration,
			}
			if poster != "" {
				movie.PosterURL = &poster
			}
			if err := tx.Create(&movie).Error; err != nil {
				return err
			}
			movieGenres := make([]models.MovieGenre, 0, len(genreIDs))
			for _, gid := range genreIDs {
				movieGenres = append(movieGenres, models.MovieGenre{
					MovieID: movie.ID,
					GenreID: gid,
				})
			}
			return tx.Create(&movieGenres).Error
		})
		if err != nil {
			return err
		}
	}
	return nil
}
