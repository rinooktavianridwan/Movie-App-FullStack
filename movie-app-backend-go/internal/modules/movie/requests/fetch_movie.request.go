package requests

type FetchIMDbRequest struct {
	ImdbID string `json:"imdb_id" binding:"required"`
}
