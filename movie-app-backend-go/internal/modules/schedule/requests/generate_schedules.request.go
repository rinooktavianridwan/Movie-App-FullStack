package requests

type GenerateSchedulesRequest struct {
	DaysAhead  int     `json:"days_ahead,omitempty"`
	MaxMovies  int     `json:"max_movies,omitempty"`
	OpenHour   int     `json:"open_hour,omitempty"`
	CloseHour  int     `json:"close_hour,omitempty"`
	BufferMins int     `json:"buffer_mins,omitempty"`
	MinPrice   float64 `json:"min_price,omitempty"`
	MaxPrice   float64 `json:"max_price,omitempty"`
}