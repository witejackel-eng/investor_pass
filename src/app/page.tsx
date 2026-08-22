"use client";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useStore } from "@/stores/app-store";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { Masthead } from "@/components/investor/masthead";
import { Footer } from "@/components/investor/footer";
import { HomeView, InvestorsView, InvestorView, Loading } from "@/components/investor/views-core";
import { SearchView, LibraryView } from "@/components/investor/views-product";
import { PassageView } from "@/components/investor/views-passage";
import { CommandPalette } from "@/components/investor/command-palette";

// Route-level code splitting: core reading path stays eager,
// everything else loads on demand with a layout-stable fallback.
const opts = { loading: Loading };

const TopicView = dynamic(() => import("@/components/investor/views-entity").then((m) => ({ default: m.TopicView })), opts);
const CompanyView = dynamic(() => import("@/components/investor/views-entity").then((m) => ({ default: m.CompanyView })), opts);
const YearView = dynamic(() => import("@/components/investor/views-entity").then((m) => ({ default: m.YearView })), opts);
const SourceView = dynamic(() => import("@/components/investor/views-entity").then((m) => ({ default: m.SourceView })), opts);
const ConceptView = dynamic(() => import("@/components/investor/views-concept").then((m) => ({ default: m.ConceptView })), opts);
const EventView = dynamic(() => import("@/components/investor/views-event").then((m) => ({ default: m.EventView })), opts);
const TimelineView = dynamic(() => import("@/components/investor/views-timeline").then((m) => ({ default: m.TimelineView })), opts);
const CompareView = dynamic(() => import("@/components/investor/views-compare").then((m) => ({ default: m.CompareView })), opts);
const TrailsLazy = dynamic(() => import("@/components/investor/views-trails-lazy").then((m) => ({ default: m.TrailsLazy })), opts);
const BookmarksView = dynamic(() => import("@/components/investor/views-product").then((m) => ({ default: m.BookmarksView })), opts);
const SavedSearchesView = dynamic(() => import("@/components/investor/views-product").then((m) => ({ default: m.SavedSearchesView })), opts);
const CollectionsView = dynamic(() => import("@/components/investor/views-product").then((m) => ({ default: m.CollectionsView })), opts);
const WatchlistView = dynamic(() => import("@/components/investor/views-watchlist").then((m) => ({ default: m.WatchlistView })), opts);
const AccountView = dynamic(() => import("@/components/investor/views-auth").then((m) => ({ default: m.AccountView })), opts);
const UpgradeView = dynamic(() => import("@/components/investor/views-auth").then((m) => ({ default: m.UpgradeView })), opts);
const LoginView = dynamic(() => import("@/components/investor/views-auth").then((m) => ({ default: m.LoginView })), opts);
const SignupView = dynamic(() => import("@/components/investor/views-auth").then((m) => ({ default: m.SignupView })), opts);
const AdminView = dynamic(() => import("@/components/investor/views-auth").then((m) => ({ default: m.AdminView })), opts);

export default function Home() {
  const { view, params, loadUser, go } = useStore();
  useKeyboardShortcuts();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

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
