"use client";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useStore, type View } from "@/stores/app-store";
import { isAllAccess } from "@/lib/promo";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { Masthead } from "@/components/investor/masthead";
import { Footer } from "@/components/investor/footer";
import { HomeView, InvestorsView, InvestorView, Loading } from "@/components/investor/views-core";
import { SearchView, LibraryView } from "@/components/investor/views-product";
import { PassageView } from "@/components/investor/views-passage";
import { CommandPalette } from "@/components/investor/command-palette";

// Route-level code splitting: core reading path stays eager,
// everything else loads on demand with a layout-stable fallback.
const TopicView = dynamic(() => import("@/components/investor/views-entity").then((m) => ({ default: m.TopicView })), { loading: () => <Loading /> });
const CompanyView = dynamic(() => import("@/components/investor/views-entity").then((m) => ({ default: m.CompanyView })), { loading: () => <Loading /> });
const YearView = dynamic(() => import("@/components/investor/views-entity").then((m) => ({ default: m.YearView })), { loading: () => <Loading /> });
const SourceView = dynamic(() => import("@/components/investor/views-entity").then((m) => ({ default: m.SourceView })), { loading: () => <Loading /> });
const ConceptView = dynamic(() => import("@/components/investor/views-concept").then((m) => ({ default: m.ConceptView })), { loading: () => <Loading /> });
const EventView = dynamic(() => import("@/components/investor/views-event").then((m) => ({ default: m.EventView })), { loading: () => <Loading /> });
const TimelineView = dynamic(() => import("@/components/investor/views-timeline").then((m) => ({ default: m.TimelineView })), { loading: () => <Loading /> });
const CompareView = dynamic(() => import("@/components/investor/views-compare").then((m) => ({ default: m.CompareView })), { loading: () => <Loading /> });
const TrailsLazy = dynamic(() => import("@/components/investor/views-trails-lazy").then((m) => ({ default: m.TrailsLazy })), { loading: () => <Loading /> });
const GraphView = dynamic(() => import("@/components/investor/views-graph").then((m) => ({ default: m.GraphView })), { loading: () => <Loading /> });
const BookmarksView = dynamic(() => import("@/components/investor/views-product").then((m) => ({ default: m.BookmarksView })), { loading: () => <Loading /> });
const SavedSearchesView = dynamic(() => import("@/components/investor/views-product").then((m) => ({ default: m.SavedSearchesView })), { loading: () => <Loading /> });
const CollectionsView = dynamic(() => import("@/components/investor/views-product").then((m) => ({ default: m.CollectionsView })), { loading: () => <Loading /> });
const WatchlistView = dynamic(() => import("@/components/investor/views-watchlist").then((m) => ({ default: m.WatchlistView })), { loading: () => <Loading /> });
const AccountView = dynamic(() => import("@/components/investor/views-auth").then((m) => ({ default: m.AccountView })), { loading: () => <Loading /> });
const UpgradeView = dynamic(() => import("@/components/investor/views-auth").then((m) => ({ default: m.UpgradeView })), { loading: () => <Loading /> });
const LoginView = dynamic(() => import("@/components/investor/views-auth").then((m) => ({ default: m.LoginView })), { loading: () => <Loading /> });
const SignupView = dynamic(() => import("@/components/investor/views-auth").then((m) => ({ default: m.SignupView })), { loading: () => <Loading /> });
const ForgotView = dynamic(() => import("@/components/investor/views-auth").then((m) => ({ default: m.ForgotView })), { loading: () => <Loading /> });
const ResetView = dynamic(() => import("@/components/investor/views-auth").then((m) => ({ default: m.ResetView })), { loading: () => <Loading /> });
const AdminView = dynamic(() => import("@/components/investor/views-auth").then((m) => ({ default: m.AdminView })), { loading: () => <Loading /> });

export function AppRoot({ initialView, initialParams }: { initialView?: View; initialParams?: Record<string, string | undefined> }) {
  const { view, params, loadUser, go, hasHashView } = useStore();
  useKeyboardShortcuts();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Real-path entry (/search, /compare): set the view without writing a
  // hash so the URL stays clean and shareable. Hash navigation continues
  // to work on top of it once the user moves within the app.
  useEffect(() => {
    if (initialView && !hasHashView) {
      useStore.setState({ view: initialView, params: initialParams ?? {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bootstrap once
  }, [initialView]);

  const renderView = () => {
    switch (view) {
      case "home": return <HomeView />;
      case "investors": return <InvestorsView />;
      case "investor": return params.slug ? <InvestorView slug={params.slug} /> : <InvestorsView />;
      case "timeline": return params.slug ? <TimelineView slug={params.slug} /> : <InvestorsView />;
      case "topic": return params.slug ? <TopicView slug={params.slug} investor={params.investor} /> : <HomeView />;
      case "company": return params.slug ? <CompanyView slug={params.slug} investor={params.investor} /> : <HomeView />;
      case "year": return params.year ? <YearView year={params.year} investor={params.investor} /> : <HomeView />;
      case "source": return params.slug ? <SourceView slug={params.slug} /> : <HomeView />;
      case "passage": return params.id ? <PassageView id={params.id} investor={params.investor} /> : <HomeView />;
      case "concept": return params.slug ? <ConceptView slug={params.slug} investor={params.investor} /> : <HomeView />;
      case "event": return params.slug ? <EventView slug={params.slug} investor={params.investor} /> : <HomeView />;
      case "search": return <SearchView initialQuery={params.q || ""} person={params.person} theme={params.theme} company={params.company} concept={params.concept} event={params.event} />;
      case "trails": return <TrailsLazy go={go} />;
      case "graph": return <GraphView />;
      case "compare": return <CompareView />;
      case "trailDetail": return <TrailsLazy slug={params.slug} go={go} />;
      case "library": return <LibraryView />;
      case "bookmarks": return <BookmarksView />;
      case "searches": return <SavedSearchesView />;
      case "collections": return <CollectionsView />;
      case "watchlist": return <WatchlistView />;
      case "account": return <AccountView />;
      case "upgrade": return <UpgradeView />;
      case "login": return <LoginView />;
      case "signup": return <SignupView />;
      case "forgot": return <ForgotView />;
      case "reset": return params.token ? <ResetView token={params.token} /> : <ForgotView />;
      case "admin": return <AdminView />;
      default: return <HomeView />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Masthead />
      <main className="flex-1">{renderView()}</main>
      <Footer />
      <CommandPalette />
    </div>
  );
}

