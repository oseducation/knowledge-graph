package model

type Subscription struct {
	ID         string `json:"id" db:"subscription_id"`
	CustomerID string `json:"customer" db:"customer_id"`
	CreatedAt  int64  `json:"created" db:"created_at"`
	PlanID     string `json:"plan" db:"plan_id"`
	Status     string `json:"status" db:"status"`
}
