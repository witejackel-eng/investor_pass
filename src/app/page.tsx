"use client";
import { useEffect } from "react";
import { useStore } from "@/stores/app-store";
import { Masthead } from "@/components/investor/masthead";
import { Footer } from "@/components/investor/footer";
import { HomeView, InvestorsView, InvestorView } from "@/components/investor/views-core";
import { TopicView, CompanyView, YearView, SourceView } from "@/components/investor/views-entity";
import { SearchView, LibraryView, BookmarksView, SavedSearchesView, CollectionsView } from "@/components/investor/views-product";
import { LoginView, SignupView, UpgradeView, AccountView, AdminView } from "@/components/investor/views-auth";
import { TimelineView } from "@/components/investor/views-timeline";
import { PassageView } from "@/components/investor/views-passage";

export default function Home() {
  const { view, params, loadUser, go } = useStore();

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
      case "search": return <SearchView initialQuery={params.q || ""} person={params.person} theme={params.theme} company={params.company} concept={params.concept} event={params.event} />;
      case "library": return <LibraryView />;
      case "bookmarks": return <BookmarksView />;
      case "searches": return <SavedSearchesView />;
      case "collections": return <CollectionsView />;
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
    </div>
  );
}
