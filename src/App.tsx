import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { RequisitionsPage } from './pages/RequisitionsPage'
import { ApprovalsPage } from './pages/ApprovalsPage'
import { VendorsPage } from './pages/VendorsPage'
import { PurchaseOrdersPage } from './pages/PurchaseOrdersPage'
import { GoodsReceiptPage } from './pages/GoodsReceiptPage'
import { InvoicesPage } from './pages/InvoicesPage'
import { ItemMasterPage } from './pages/ItemMasterPage'
import { BudgetControlPage } from './pages/BudgetControlPage'
import { SpendAnalyticsPage } from './pages/SpendAnalyticsPage'
import { InquiryManagementPage } from './pages/InquiryManagementPage'
import { RfqComparisonPage } from './pages/RfqComparisonPage'
import { VendorAuditPage } from './pages/VendorAuditPage'
import { PaymentsPage } from './pages/PaymentsPage'
import { RateContractsPage } from './pages/RateContractsPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Authentication Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Application Workspace */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="approvals" element={<ApprovalsPage />} />
              <Route path="requisitions" element={<RequisitionsPage />} />
              <Route path="inquiries" element={<InquiryManagementPage />} />
              <Route path="rfqs" element={<RfqComparisonPage />} />
              <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
              <Route path="goods-receipts" element={<GoodsReceiptPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="vendors" element={<VendorsPage />} />
              <Route path="vendor-performance" element={<VendorAuditPage />} />
              <Route path="vendor-qualification" element={<VendorAuditPage />} />
              <Route path="items" element={<ItemMasterPage />} />
              <Route path="budgets" element={<BudgetControlPage />} />
              <Route path="rate-contracts" element={<RateContractsPage />} />
              <Route path="spend-analytics" element={<SpendAnalyticsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="audit-trail" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
