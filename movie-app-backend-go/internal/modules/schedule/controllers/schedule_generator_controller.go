package controllers

import (
	"net/http"

	"movie-app-go/internal/modules/schedule/requests"
	"movie-app-go/internal/modules/schedule/services"
	"movie-app-go/internal/utils"

	"github.com/gin-gonic/gin"
)

type ScheduleGeneratorController struct {
	ScheduleGeneratorService *services.ScheduleGeneratorService
}

func NewScheduleGeneratorController(s *services.ScheduleGeneratorService) *ScheduleGeneratorController {
	return &ScheduleGeneratorController{ScheduleGeneratorService: s}
}

func (c *ScheduleGeneratorController) GenerateSchedules(ctx *gin.Context) {
	var req requests.GenerateSchedulesRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, utils.BadRequestResponse(err.Error()))
		return
	}

	result, err := c.ScheduleGeneratorService.GenerateSchedules(services.GenerateSchedulesOptions{
		DaysAhead:  req.DaysAhead,
		MaxMovies:  req.MaxMovies,
		OpenHour:   req.OpenHour,
		CloseHour:  req.CloseHour,
		BufferMins: req.BufferMins,
		MinPrice:   req.MinPrice,
		MaxPrice:   req.MaxPrice,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerErrorResponse(err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(
		http.StatusOK,
		"Schedule generation completed",
		result,
	))
}