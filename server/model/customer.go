package model

type Customer struct {
	CustomerID string `json:"id" db:"customer_id"`
	Email      string `json:"email" db:"email"`
	CreatedAt  int64  `json:"created" db:"created_at"`
}
