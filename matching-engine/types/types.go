package matchingengine

type OrderStatus string

const (
	ORDER_ACCEPTED  OrderStatus = "ORDER_ACCEPTED"
	ORDER_REJECTED  OrderStatus = "ORDER_REJECTED"
	ORDER_PENDING   OrderStatus = "ORDER_PENDING"
	ORDER_CANCELLED OrderStatus = "ORDER_CANCELLED"
)

type Bids struct {
	OrderId     string      `json:"orderId"`
	RoomId      string      `json:"roomId"`
	Price       float64     `json:"price"`
	ProductName string      `json:"productName"`
	OwnerName   string      `json:"ownerName"`
	OwnerId     string      `json:"ownerId"`
	BuyerName   string      `json:"buyerName"`
	BuyerId     string      `json:"buyerId"`
	Status      OrderStatus `json:"status"`
}
