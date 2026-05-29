package controllers

import (
	"net/http"
	"movie-app-go/internal/modules/movie/services"
	"movie-app-go/internal/utils"

	"github.com/gin-gonic/gin"
)

type TMDBController struct {
	TMDBService *services.TMDBService
}

func NewTMDBController(s *services.TMDBService) *TMDBController {
	return &TMDBController{TMDBService: s}
}

// Manual fetch endpoint (admin only)
func (c *TMDBController) ManualFetch(ctx *gin.Context) {
	err := c.TMDBService.FetchNowPlaying()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerErrorResponse(err.Error()))
		return
	}
	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Fetched movies from TMDB successfully", nil))
}
