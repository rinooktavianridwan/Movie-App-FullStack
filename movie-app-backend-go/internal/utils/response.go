package utils

type StandardResponse struct {
	StatusCode int         `json:"status_code"`
	Message    string      `json:"message"`
	Version    string      `json:"version"`
	Data       interface{} `json:"data"`
	ErrMsg     string      `json:"error,omitempty"`
}

func SuccessResponse(statusCode int, message string, data interface{}) StandardResponse {
	return StandardResponse{
		StatusCode: statusCode,
		Message:    message,
		Version:    "1.0.0",
		Data:       data,
	}
}

func ErrorResponse(statusCode int, errMsg string) StandardResponse {
	return StandardResponse{
		StatusCode: statusCode,
		Message:    errMsg,
		Version:    "1.0.0",
		Data:       nil,
	}
}

func BadRequestResponse(errMsg string) StandardResponse {
	return ErrorResponse(400, errMsg)
}

func UnauthorizedResponse(errMsg string) StandardResponse {
	return ErrorResponse(401, errMsg)
}

func ForbiddenResponse(errMsg string) StandardResponse {
	return ErrorResponse(403, errMsg)
}

func NotFoundResponse(errMsg string) StandardResponse {
	return ErrorResponse(404, errMsg)
}

func InternalServerErrorResponse(errMsg string) StandardResponse {
	return ErrorResponse(500, errMsg)
}
