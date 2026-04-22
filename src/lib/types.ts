export interface OrderItem {
  id: number
  oosSku: string
  unitsOrdered: string
  unitsUnavailable: string
  unitPrice: string
  thc: string
  subbedSku: string
  subThc: string
  subOffered: 'yes' | 'no' | null
  notes?: string; 
}

export interface OrderData {
  placedOrder: string
  retailerName: string
  items: OrderItem[]
}
