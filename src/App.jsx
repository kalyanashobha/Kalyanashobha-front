import { Routes, Route, Navigate } from "react-router-dom";
import DataApproval from "./Admin/DataApproval/DataApproval.jsx";

// --- USER IMPORTS ---
import Navbar from "./User/Components/Navbar.jsx";
import Faq from "./User/Components/Faq";
import Herobanner from "./User/Components/Herobanner.jsx";
import Footer from "./User/Components/Footer.jsx";
import Terms from "./User/Components/Terms";
import Refund from "./User/Components/Refund";
import AboutUs from "./User/Components/About";
import Testimonials from "./User/Components/Testimonials.jsx";
import ProcessFlow from "./User/Components/ProcessFlow.jsx";
import Registration from "./User/Pages/Registration/Registration.jsx";
import Login from "./User/Pages/Login/Login.jsx";
import HelpCenter from "./User/Pages/HelpCenter/HelpCenter.jsx";
import UserDashboard from "./User/Pages/UserDashboard/UserDashboard.jsx";
import UserPreference from "./User/Pages/UserDashboard/UserPreference.jsx";
import PayRegistration from "./User/Pages/PaymentRegistration/PaymentRegistration.jsx";
import Payments from "./User/Pages/Payments/Payments.jsx";
import Myprofile from "./User/Pages/MyProfile/MyProfile.jsx";
import Interests from "./User/Pages/Interests.jsx";
import UserVendor from "./User/Pages/VendorList/VendorList.jsx"; 

// --- AGENT PORTAL IMPORTS ---
import AgentLogin from "./Agents/AgentLogin.jsx"; 
import AgentDashboard from "./Agents/AgentDashboard.jsx"; 

// --- ADMIN IMPORTS ---
import AdminLogin from "./Admin/Login/AdminLogin.jsx";
import AdminDashboard from "./Admin/Dashboard/Dashboard.jsx";
import AdminCertificate from "./Admin/AdminCertificate/AdminCertificates.jsx";
import AdminLayout from "./Admin/AdminLayout.jsx";
import AdminPostTestimonial from "./Admin/AdminPostTestimonial.jsx";

import UserManagement from "./Admin/User/UserManagement.jsx";
import RegistrationApprovals from "./Admin/RegistrationApprovals/RegistrationApprovals.jsx";
import InterestApproval from "./Admin/InterestApproval/InterestApprovals.jsx";
import AdminAgentManagement from "./Admin/AgentManagement/AgentManagement.jsx"; 
import AdminVendor from "./Admin/VendorManagement/VendorManagement.jsx"; 
import AddCommunity from "./Admin/AddCommunity/AddCommunity.jsx";
import AdminVendorLeads from "./Admin/AdminVendorLeads/AdminVendorLeads.jsx"; 
import AdminHelpCenter from "./Admin/AdminHelpCenter/AdminHelpCenter.jsx"; 
import CreateModerator from "./Admin/CreateModerator.jsx"; 
import AdminFeeSettings from "./Admin/AdminFeeSettings.jsx"; 
import AdminPremiumRequests from "./Admin/AdminPremiumRequests.jsx"; 
import AdminPageContent from "./Admin/AdminPageContent/AdminPageContent.jsx";
import UserList from "./Admin/UserList.jsx";
import ModeratorLogin from "./Admin/ModeratorLogin.jsx";


// 1. Protected Route Component (FOR USERS)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
};

// 2. Public Route Component (FOR USERS)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/dashboard" replace /> : children;
};

// 3. Protected Route Component (FOR AGENTS)
const ProtectedAgentRoute = ({ children }) => {
  const token = localStorage.getItem("agentToken");
  return token ? children : <Navigate to="/agent/login" replace />;
};

// 4. Protected Route Component (FOR ADMIN)
const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/admin/login" replace />;
};

// 5. Public Route Component (FOR ADMIN)
const PublicAdminRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  // If admin already logged in, send directly to their dashboard
  return token ? <Navigate to="/admin/dashboard" replace /> : children;
};

// 6. Protected Route Component (FOR MODERATOR)
const ProtectedModeratorRoute = ({ children }) => {
  // Uses adminToken just like Admin as requested
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/moderator" replace />;
};

// 7. Public Route Component (FOR MODERATOR)
const PublicModeratorRoute = ({ children }) => {
  // Uses adminToken just like Admin as requested
  const token = localStorage.getItem("adminToken");
  // If moderator already logged in, send directly to their dashboard
  return token ? <Navigate to="/moderator/dashboard" replace /> : children;
};

function App() {
  return (
    <Routes>
      {/* --- OPEN ACCESS ROUTES (Accessible by ANYONE) --- */}
      <Route path="/vendor" element={<UserVendor />} />
      <Route path="/terms" element={<Terms/>} />
      <Route path="/refund" element={<Refund/>} />
      <Route path="/faq" element={<Faq/>} />

      {/* Standalone About and Testimonials pages */}
      <Route path="/about" element={
        <>
          <Navbar />
          <AboutUs />
          <Footer />
        </>
      } />
      <Route path="/testimonials" element={
        <>
          <Navbar />
          <Testimonials />
          <Footer />
        </>
      } />

      {/* --- PUBLIC USER ROUTES (Redirects to Dashboard if already logged in) --- */}
      <Route 
        path="/" 
        element={
          <PublicRoute>
            <>
              <Navbar />
              <Herobanner />
              <ProcessFlow />
              <AboutUs/>
              <Testimonials/>
              <Footer />
            </>
          </PublicRoute>
        } 
      />
      <Route path="/registration" element={<PublicRoute><Registration /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

      {/* --- PROTECTED USER ROUTES (Login Required) --- */}
      <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
      <Route path="/preference" element={<ProtectedRoute><UserPreference/></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
      <Route path="/help" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
      <Route path="/interests" element={<ProtectedRoute><Interests /></ProtectedRoute>} />
      <Route path="/myprofile" element={<ProtectedRoute><Myprofile /></ProtectedRoute>} />
      <Route path="/payment-registration" element={<ProtectedRoute><PayRegistration /></ProtectedRoute>} />

      {/* --- AGENT PORTAL ROUTES --- */}
      <Route path="/agent/login" element={<AgentLogin />} />
      <Route path="/agent/dashboard" element={
        <ProtectedAgentRoute>
          <AgentDashboard />
        </ProtectedAgentRoute>
      } />

      {/* --- MODERATOR ROUTES --- */}
      {/* Acts as the login page directly on /moderator */}
      <Route path="/moderator" element={
        <PublicModeratorRoute>
          <ModeratorLogin />
        </PublicModeratorRoute>
      } />

      {/* Moderator dashboard route structure */}
      <Route path="/moderator/dashboard" element={<ProtectedModeratorRoute><AdminLayout /></ProtectedModeratorRoute>}>
        <Route index element={<AdminDashboard />} />
        {/* You can add specific nested moderator allowed routes here later if needed */}
      </Route>

      {/* --- ADMIN ROUTES --- */}
      <Route path="/admin/login" element={
        <PublicAdminRoute>
          <AdminLogin />
        </PublicAdminRoute>
      } />
      
      <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="registration-approvals" element={<RegistrationApprovals />} />
        <Route path="interest-approvals" element={<InterestApproval />} />
        <Route path="agents" element={<AdminAgentManagement />} /> 
        <Route path="vendors" element={<AdminVendor />} />
        <Route path="user-certificates" element={<AdminCertificate />} />
        <Route path="add-fields" element={<AddCommunity />} />
        <Route path="vendor-leads" element={<AdminVendorLeads/>} />
        <Route path="help-center" element={<AdminHelpCenter/>} />
        <Route path="data-approval" element={<DataApproval/>} />
        <Route path="page-content" element={<AdminPageContent/>} />
        <Route path="add-testimonial" element={<AdminPostTestimonial/>} />
        <Route path="moderater" element={<CreateModerator/>} />
        <Route path="fee-settings" element={<AdminFeeSettings/>} />
        <Route path="premium-users" element={<AdminPremiumRequests/>} />
        <Route path="premium-user" element={<UserList/>} />
      </Route>
      
    </Routes>
  );
}

export default App;
