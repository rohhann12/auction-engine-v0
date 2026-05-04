export interface Bids{
    orderId:string,
    roomId:string,
    price:number,
    productName:string,
    ownerName:string,
    ownerId:string,
    buyerName:string,
    buyerId:string,
    status:ORDER_ACCEPTED|ORDER_REJECTED|ORDER_PENDING|ORDER_CANCELLED,
    timeOrderPlaced:string
}

export type ORDER_ACCEPTED="ORDER_ACCEPTED"
export type ORDER_REJECTED="ORDER_REJECTED"
export type ORDER_PENDING="ORDER_PENDING"
export type ORDER_CANCELLED="ORDER_CANCELLED"
// TO-DO
// FOR FAILURES USE THIS FLAG
export type IOC="IOC"
