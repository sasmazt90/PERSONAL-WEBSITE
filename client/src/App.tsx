import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PortfolioDataProvider } from "./contexts/PortfolioDataContext";
import { SiteContentProvider } from "./contexts/SiteContentContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import BlogList from "./pages/BlogList";
import BlogArticle from "./pages/BlogArticle";
import PrivacyPolicy from "./pages/PrivacyPolicy";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/privacy-policy"} component={PrivacyPolicy} />
      <Route path={"/blog"} component={BlogList} />
      <Route path={"/blog/:slug"} component={BlogArticle} />
      <Route path={"/blog/:slug/:lang"} component={BlogArticle} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <PortfolioDataProvider>
          <SiteContentProvider>
            <LanguageProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </LanguageProvider>
          </SiteContentProvider>
        </PortfolioDataProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
