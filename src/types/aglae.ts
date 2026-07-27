export interface MarketplaceUser {
  id: number
  email: string
  name: string
  first_name: string
  last_name: string
  role: MarketplaceRole
  team: string | null
  is_online: boolean
}

export interface MarketplaceRole {
  id: number
  name: string
  access_to_extraction: boolean
  customers_access: boolean
  customers_edit: boolean
  customers_review_access: boolean
  full_access: boolean
  formula_edit: boolean
  email_sending: boolean
  devices_access: boolean
}
