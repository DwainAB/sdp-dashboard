import ExtractionPage from '../../pages/aglae/ExtractionPage'
import ClientsPage from '../../pages/aglae/ClientsPage'
import CustomerDetailsPage from '../../pages/aglae/CustomerDetailsPage'
import FormulaDetailsPage from '../../pages/aglae/FormulaDetailsPage'
import GroupsPage from '../../pages/aglae/GroupsPage'
import GroupDetailsPage from '../../pages/aglae/GroupDetailsPage'
import AnalysisPage from '../../pages/aglae/AnalysisPage'
import OrdersPage from '../../pages/aglae/OrdersPage'
import OrderDetailsPage from '../../pages/aglae/OrderDetailsPage'
import TeamPage from '../../pages/aglae/TeamPage'
import DevicesPage from '../../pages/aglae/DevicesPage'

export interface MarketplaceRendererProps {
  section: string
  selectedCustomerId: number | null
  selectedFormulaId: number | null
  selectedGroupIds: number[]
  selectedOrderId: number | null
  onOpenCustomer: (id: number) => void
  onBackToClients: () => void
  onOpenFormula: (id: number) => void
  onBackToCustomer: () => void
  onOpenGroups: (ids: number[]) => void
  onBackToGroups: () => void
  onOpenOrder: (id: number) => void
  onBackToOrders: () => void
  onCustomerDeleted: () => void
}

export default function MarketplaceRenderer({
  section,
  selectedCustomerId,
  selectedFormulaId,
  selectedGroupIds,
  selectedOrderId,
  onOpenCustomer,
  onBackToClients,
  onOpenFormula,
  onBackToCustomer,
  onOpenGroups,
  onBackToGroups,
  onOpenOrder,
  onBackToOrders,
  onCustomerDeleted,
}: MarketplaceRendererProps) {
  switch (section) {
    case 'extraction':
      return <ExtractionPage />

    case 'clients':
      if (selectedFormulaId !== null) {
        return (
          <FormulaDetailsPage
            formulaId={selectedFormulaId}
            customerId={selectedCustomerId ?? 0}
            onBack={onBackToCustomer}
          />
        )
      }
      if (selectedCustomerId !== null) {
        return (
          <CustomerDetailsPage
            customerId={selectedCustomerId}
            onBack={onBackToClients}
            onCustomerDeleted={onCustomerDeleted}
            onOpenFormula={onOpenFormula}
          />
        )
      }
      return <ClientsPage onOpenCustomer={onOpenCustomer} onOpenGroups={onOpenGroups} />

    case 'groups':
      if (selectedGroupIds.length > 0) {
        return <GroupDetailsPage groupIds={selectedGroupIds} onBack={onBackToGroups} />
      }
      return <GroupsPage onOpenGroups={onOpenGroups} />

    case 'analysis':
      return <AnalysisPage />

    case 'orders':
      if (selectedOrderId !== null) {
        return <OrderDetailsPage orderId={selectedOrderId} onBack={onBackToOrders} />
      }
      return <OrdersPage onOpenOrder={onOpenOrder} />

    case 'team':
      return <TeamPage />

    case 'devices':
      return <DevicesPage />

    default:
      return <ClientsPage onOpenCustomer={onOpenCustomer} onOpenGroups={onOpenGroups} />
  }
}
