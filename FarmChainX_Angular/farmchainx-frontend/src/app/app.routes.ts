import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

/* =======================
   APP ROUTES
======================= */
export const routes: Routes = [

  /* =======================
     PUBLIC ROUTES
  ======================= */
  {
    path: '',
    loadComponent: () =>
      import('./home/home.component')
        .then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register.component')
        .then(m => m.RegisterComponent)
  },
  {
    path: 'marketplace',
    loadComponent: () =>
      import('./features/marketplace/marketplace.component')
        .then(m => m.MarketplaceComponent)
  },

  /* =======================
     TRACEABILITY ROUTE
  ======================= */
  {
    path: 'trace/:batchId',
    loadComponent: () =>
      import('./features/traceability/traceability.component')
        .then(m => m.TraceabilityComponent)
  },

  /* =======================
     SUPPORT & LEGAL
  ======================= */
  {
    path: 'help-center',
    loadComponent: () =>
      import('./pages/help-center/help-center.component')
        .then(m => m.HelpCenterComponent)
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./pages/legal/privacy-policy.component')
        .then(m => m.PrivacyPolicyComponent)
  },
  {
    path: 'terms-conditions',
    loadComponent: () =>
      import('./pages/legal/terms-conditions.component')
        .then(m => m.TermsConditionsComponent)
  },

  /* =======================
     FARMER ROUTES
  ======================= */
  {
    path: 'farmer',
    canActivate: [AuthGuard],
    data: { roles: ['FARMER'] },
    loadComponent: () =>
      import('./pages/dashboard-wrapper/dashboard-wrapper.component')
        .then(m => m.DashboardWrapperComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./farmer/farmer-dashboard/farmer-dashboard.component')
            .then(m => m.FarmerDashboardComponent)
      },
      {
        path: 'ai-assistant',
        loadComponent: () =>
          import('./farmer/ai-assistant/farmer-ai.component')
            .then(m => m.FarmerAIComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  /* =======================
     CONSUMER ROUTES
  ======================= */
  {
    path: 'consumer',
    canActivate: [AuthGuard],
    data: { roles: ['BUYER'] },
    loadComponent: () =>
      import('./pages/dashboard-wrapper/dashboard-wrapper.component')
        .then(m => m.DashboardWrapperComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./consumer/consumer-dashboard/consumer-dashboard.component')
            .then(m => m.ConsumerDashboardComponent)
      },
      {
        path: 'ai-assistant',
        loadComponent: () =>
          import('./consumer/ai-assistant/ai-assistant.component')
            .then(m => m.AIAssistantComponent)
      },
      {
        path: 'my-orders',
        loadComponent: () =>
          import('./consumer/my-orders/my-orders.component')
            .then(m => m.MyOrdersComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  /* =======================
     DISTRIBUTOR ROUTES
  ======================= */
  {
    path: 'distributor',
    canActivate: [AuthGuard],
    data: { roles: ['DISTRIBUTOR'] },
    loadComponent: () =>
      import('./pages/dashboard-wrapper/dashboard-wrapper.component')
        .then(m => m.DashboardWrapperComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./distributor/distributor-dashboard/distributor-dashboard.component')
            .then(m => m.DistributorDashboardComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  /* =======================
     ADMIN ROUTES
  ======================= */
  {
    path: 'admin',
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./admin/admin-layout/admin-layout.component')
        .then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin/dashboard/admin-dashboard.component')
            .then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./admin/users/admin-users.component')
            .then(m => m.AdminUsersComponent)
      },
      {
        path: 'crops',
        loadComponent: () =>
          import('./admin/crops/admin-crops.component')
            .then(m => m.AdminCropsComponent)
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./admin/reports/admin-reports.component')
            .then(m => m.AdminReportsComponent)
      },
      {
        path: 'support',
        loadComponent: () =>
          import('./admin/support/admin-support.component')
            .then(m => m.AdminSupportComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  /* =======================
     FALLBACK ROUTE
  ======================= */
  { path: '**', redirectTo: '' }
];
