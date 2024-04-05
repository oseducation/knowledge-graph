package model

type Customer struct {
	CustomerID string `json:"id" db:"customer_id"`
	Email      string `json:"email" db:"email"`
	CreatedAt  int64  `json:"created_at" db:"created_at"`
	DeletedAt  int64  `json:"deleted_at" db:"deleted_at"`
	UserID     string `json:"user_id" db:"user_id"`
}

type Subscription struct {
	ID                 string `json:"id" db:"subscription_id"`
	CustomerID         string `json:"customer_id" db:"customer_id"`
	CreatedAt          int64  `json:"created_at" db:"created_at"`
	DeletedAt          int64  `json:"deleted_at" db:"deleted_at"`
	PlanID             string `json:"plan_id" db:"plan_id"`
	Status             string `json:"status" db:"status"`
	TriggeredByEventAt int64  `json:"triggered_by_event_at" db:"triggered_by_event_at"`
}

// BeforeSave should be called before storing the customer
func (c *Customer) BeforeSave() {
	if c.CreatedAt == 0 {
		c.CreatedAt = GetMillis()
	}
}

// BeforeSave should be called before storing the subscription
func (s *Subscription) BeforeSave() {
	if s.CreatedAt == 0 {
		s.CreatedAt = GetMillis()
	}
}
