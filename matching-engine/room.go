package matchingengine

import "sync"

// type BidStatus string (ORDER_ACCEPTED,ORDER_REJECTED,ORDER_PENDING)

type Bid struct {
	orderId     string
	roomId      string
	productName string
	price       float64
	buyerId     string
	buyerName   string
	ownerID     string
	ownerName   string
}

type Room struct {
	roomId       string
	currentPrice float64
	bidChannel   chan Bid
	done         chan struct{}
	mu           sync.Mutex
}

func newRoom(roomId string)
