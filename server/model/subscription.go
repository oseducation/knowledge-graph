package model

type Subscription struct {
	ID             string `json:"id" db:"id"`
	UserID         string `json:"user_id" db:"user_id"`
	CustomerID     string `json:"customer_id" db:"customer_id"`
	SubscriptionID string `json:"subscription_id" db:"subscription_id"`
	PriceID        string `json:"price_id" db:"price_id"`
	Active         bool   `json:"active" db:"active"`
	CreatedAt      int64  `json:"created_at" db:"created_at"`
	UpdatedAt      int64  `json:"updated_at" db:"updated_at"`
	DeletedAt      int64  `json:"deleted_at" db:"deleted_at"`
}
