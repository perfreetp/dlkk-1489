import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Sidebar, Header, Container } from "@/components/Layout";
import Home from "@/pages/Home";
import Issue from "@/pages/Issue";
import Query from "@/pages/Query";
import Accept from "@/pages/Accept";
import Repair from "@/pages/Repair";
import Audit from "@/pages/Audit";
import Stats from "@/pages/Stats";
import Review from "@/pages/Review";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="bg-gradient-glow fixed inset-0 pointer-events-none" />
      <Sidebar />
      <div className="ml-64 min-h-screen">
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <AppLayout>
              <Home />
            </AppLayout>
          }
        />
        <Route
          path="/issue"
          element={
            <AppLayout>
              <Issue />
            </AppLayout>
          }
        />
        <Route
          path="/query"
          element={
            <AppLayout>
              <Query />
            </AppLayout>
          }
        />
        <Route
          path="/accept"
          element={
            <AppLayout>
              <Accept />
            </AppLayout>
          }
        />
        <Route
          path="/repair"
          element={
            <AppLayout>
              <Repair />
            </AppLayout>
          }
        />
        <Route
          path="/audit"
          element={
            <AppLayout>
              <Audit />
            </AppLayout>
          }
        />
        <Route
          path="/stats"
          element={
            <AppLayout>
              <Stats />
            </AppLayout>
          }
        />
        <Route
          path="/review"
          element={
            <AppLayout>
              <Review />
            </AppLayout>
          }
        />
      </Routes>
    </Router>
  );
}
