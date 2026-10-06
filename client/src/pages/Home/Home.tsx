import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import HomeHero from "../../components/home/HomeHero";
import UpcomingBookings from "../../components/home/UpcomingBookings";
import PopularNearby from "../../components/home/PopularNearby";
import TodayOverview from "../../components/home/TodayOverview";
import HowItWorks from "../../components/home/HowItWorks";
import HelpfulInfo from "../../components/home/HelpfulInfo";
import AreaSelector from "../../components/AreaSelector/AreaSelector";
import { getStoredUser } from "../../services/api";
import { getBookings, type Booking } from "../../services/bookingsService";
import { getProviders } from "../../services/providersService";
import type { Provider } from "../../types/provider";
import type { Area } from "../../types/area";
import { matchesArea } from "../../utils/areaMatch";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const currentUserId = getStoredUser()?.id;

  /* ========================================================
     STATE
     ======================================================== */

  const [selectedAreas, setSelectedAreas] = useState<Area[]>([]);
  const [isAreaSelectorOpen, setIsAreaSelectorOpen] = useState(false);

  const [providers, setProviders] = useState<Provider[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  /* ========================================================
     DATA
     ======================================================== */

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const result = await getProviders();

        if (!cancelled) {
          setProviders(result);
        }
      } catch {
        if (!cancelled) {
          setLoadError("Bizneslər yüklənmədi. Bir az sonra yenidən cəhd edin.");
        }
      }

      try {
        const result = await getBookings();

        if (!cancelled) {
          /* yalnız sizin müştəri kimi etdiyiniz rezervlər */
          setMyBookings(
            result.filter((booking) => booking.customerId === currentUserId)
          );
        }
      } catch {
        /* rezervlər yüklənməsə də səhifə işləməyə davam edir */
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

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
     Reytinqə, sonra rəy sayına görə sıralanır.
     ======================================================== */

  const filteredProviders = useMemo(() => {
    const sorted = [...providers].sort(
      (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount
    );

    const hasConcreteAreas =
      selectedAreas.length > 0 &&
      !selectedAreas.some((area) => area.id === "all-baku");

    if (!hasConcreteAreas) {
      return sorted.slice(0, 4);
    }

    return sorted
      .filter((provider) =>
        selectedAreas.some((area) => matchesArea(provider.area, area.name))
      )
      .slice(0, 4);
  }, [providers, selectedAreas]);

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
     PROVIDER / BOOKING
     ======================================================== */

  const handleProviderClick = (providerId: string) => {
    navigate(`/provider/${providerId}`);
  };

  /* Tək rezerv səhifəsi yoxdur: siyahıya aparırıq */
  const handleBookingClick = () => {
    navigate("/bookings");
  };

  /* ========================================================
     STATISTICS
     ======================================================== */

  const verifiedProfiles = providers.filter(
    (provider) => provider.verified
  ).length;

  const highlyRated = providers.filter(
    (provider) => provider.reviewCount > 0 && provider.rating >= 4.5
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

        {loadError ? (
          <section className="home-section">
            <p>{loadError}</p>
          </section>
        ) : (
          !isLoading && (
            <>
              <UpcomingBookings
                bookings={myBookings}
                onBookingClick={handleBookingClick}
                onSeeAllClick={() => navigate("/bookings")}
              />

              <PopularNearby
                providers={filteredProviders}
                onProviderClick={handleProviderClick}
                onSeeAllClick={() => navigate("/search")}
              />

              <TodayOverview
                verifiedProfiles={verifiedProfiles}
                totalProfiles={providers.length}
                highlyRated={highlyRated}
              />

              <HowItWorks />

              <HelpfulInfo />
            </>
          )
        )}
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