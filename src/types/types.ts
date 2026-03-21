export interface Bids{
    roomId:string,
    price:number,
    productName:string,
    ownerName:string,
    ownerId:string,
    buyerName:string,
    buyerId:string
}

export type ORDER_ACCEPTED="ORDER_ACCEPTED"
export type ORDER_REJECTED="ORDER_REJECTED"
export type ORDER_PENDING="ORDER_PENDING"