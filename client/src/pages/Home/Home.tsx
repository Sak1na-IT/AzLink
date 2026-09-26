import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import HomeHero from "../../components/home/HomeHero";
import UpcomingBookings from "../../components/home/UpcomingBookings";
import PopularNearby from "../../components/home/PopularNearby";
import TodayOverview from "../../components/home/TodayOverview";
import RecentlyViewed from "../../components/home/RecentlyViewed";
import HowItWorks from "../../components/home/HowItWorks";
import HelpfulInfo from "../../components/home/HelpfulInfo";
import AreaSelector from "../../components/AreaSelector/AreaSelector";
import { providers } from "../../data/providers";
import { bookings } from "../../data/bookings";
import type { Area } from "../../types/area";
import { matchesArea } from "../../utils/areaMatch";
import "./Home.css";


function Home() {
  const navigate = useNavigate();

  /* ========================================================
     STATE
     ======================================================== */

  const [selectedAreas, setSelectedAreas] = useState<Area[]>([]);

  const [isAreaSelectorOpen, setIsAreaSelectorOpen] = useState(false);

  /* ========================================================
     AREA LABEL
     ======================================================== */

  const areaLabel = useMemo(() => {
    if (selectedAreas.length === 0) {
      return "Bütün Bakı";
    }

    if (selectedAreas.some((area) => area.id === "all-baku")) {
      return "Bütün Bakı";
    }

    if (selectedAreas.length === 1) {
      return selectedAreas[0].name;
    }

    return `${selectedAreas.length} ərazi seçildi`;
  }, [selectedAreas]);

  /* ========================================================
     POPULAR PROVIDERS
     ======================================================== */

  const filteredProviders = useMemo(() => {
    if (selectedAreas.length === 0) {
      return providers.slice(0, 4);
    }

    if (selectedAreas.some((area) => area.id === "all-baku")) {
      return providers.slice(0, 4);
    }

    return providers
      .filter((provider) =>
        selectedAreas.some((area) => matchesArea(provider.area, area.name))
      )
      .slice(0, 4);
  }, [selectedAreas]);

  /* ========================================================
     RECENTLY VIEWED (mock — sonra localStorage ilə əvəz olunacaq)
     ======================================================== */

  const recentProviders = useMemo(() => providers.slice(3, 7), []);

  /* ========================================================
     SEARCH
     ======================================================== */

  const handleSearch = (query: string) => {
    const cleanQuery = query.trim();

    if (!cleanQuery) {
      return;
    }

    const params = new URLSearchParams();

    params.set("q", cleanQuery);

    selectedAreas.forEach((area) => {
      if (area.id !== "all-baku") {
        params.append("area", area.name);
      }
    });

    navigate(`/search?${params.toString()}`);
  };

  /* ========================================================
     AREA SELECTOR
     ======================================================== */

  const handleAreaClick = () => {
    setIsAreaSelectorOpen(true);
  };

  const handleAreaApply = (areas: Area[]) => {
    setSelectedAreas(areas);
  };

  /* ========================================================
     PROVIDER
     ======================================================== */

  const handleProviderClick = (providerId: string) => {
    navigate(`/provider/${providerId}`);
  };

  /* ========================================================
     BOOKING
     ======================================================== */

  const handleBookingClick = (bookingId: string) => {
    navigate(`/bookings/${bookingId}`);
  };

  /* ========================================================
     STATISTICS
     ======================================================== */

  const verifiedProfiles = providers.filter(
    (provider) => provider.verified
  ).length;

  const highlyReviewed = providers.filter(
    (provider) => provider.reviewCount >= 100
  ).length;

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <>
      <main className="home-page">
        <HomeHero
          areaLabel={areaLabel}
          onAreaClick={handleAreaClick}
          onSearch={handleSearch}
        />

        <UpcomingBookings
          bookings={bookings}
          onBookingClick={handleBookingClick}
          onSeeAllClick={() => navigate("/bookings")}
        />

        <PopularNearby
          providers={filteredProviders}
          onProviderClick={handleProviderClick}
        />

        <TodayOverview
          verifiedProfiles={verifiedProfiles}
          availableToday={providers.length}
          highlyReviewed={highlyReviewed}
        />

        <RecentlyViewed
          providers={recentProviders}
          onProviderClick={handleProviderClick}
        />

        <HowItWorks />

        <HelpfulInfo />
      </main>

      {isAreaSelectorOpen && (
        <AreaSelector
          selectedAreas={selectedAreas}
          onApply={handleAreaApply}
          onClose={() => setIsAreaSelectorOpen(false)}
        />
      )}
    </>
  );
}

export default Home;