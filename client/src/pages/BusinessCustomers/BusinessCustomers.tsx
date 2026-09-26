import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Search,
  Trophy,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";

import { getBookingsByProvider } from "../../services/bookingStorage";
import { CURRENT_PROVIDER_ID } from "../../services/demoBusiness";
import { getBusinessCustomers } from "../../utils/getBusinessCustomers";
import "./BusinessCustomers.css";

const statusLabels: Record<string, string> = {
  PENDING: "Gözləyir",
  CONFIRMED: "Təsdiqlənib",
  CANCELLED: "Ləğv edilib",
  COMPLETED: "Tamamlanıb",
};

/* 2026-09-25 → 25.09.2026 */
const formatDate = (date: string) => {
  const [year, month, day] = date.split("-");

  return `${day}.${month}.${year}`;
};

function BusinessCustomers() {
  const navigate = useNavigate();

  const [customers] = useState(() =>
    getBusinessCustomers(getBookingsByProvider(CURRENT_PROVIDER_ID))
  );

  const [query, setQuery] = useState("");

  const filteredCustomers = useMemo(() => {
    const trimmed = query.trim().toLowerCase();

    if (!trimmed) {
      return customers;
    }

    return customers.filter((customer) =>
      customer.customerName.toLowerCase().includes(trimmed)
    );
  }, [customers, query]);

  const topCustomers = useMemo(() => {
  return [...customers]
    .sort((a, b) => b.bookingCount - a.bookingCount)
    .slice(0, 3)
    .filter((customer) => customer.bookingCount > 3);
}, [customers]);

  return (
    <main className="business-customers">
      <div className="business-customers__top">
        <button
          type="button"
          className="business-customers__back"
          onClick={() => navigate("/business")}
        >
          <ArrowLeft size={18} strokeWidth={1.8} />
          Biznes panelinə qayıt
        </button>
      </div>

      <section className="business-customers__header">
        <div>
          <h1>Müştərilər</h1>

          <p>
            Sizdən rezerv edən müştərilərin siyahısı və rezerv
            tarixçəsi.
          </p>
        </div>
      </section>

      <div className="business-customers__search">
        <Search size={18} strokeWidth={1.8} />

        <input
          type="text"
          placeholder="Müştəri adı üzrə axtar..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {topCustomers.length > 0 && (
        <section className="business-customers__top">
          <div className="business-customers__top-header">
            <Trophy size={18} strokeWidth={1.8} />
            <h2>Ən çox gələn müştərilər</h2>
          </div>

          <div className="business-customers__top-grid">
            {topCustomers.map((customer) => {
              const initials = customer.customerName
                .split(" ")
                .map((word) => word[0])
                .slice(0, 2)
                .join("");

              return (
                <div
                  key={customer.customerId}
                  className="business-customers__top-card"
                >
                  <div className="business-customer-card__avatar">
                    {initials}
                  </div>

                  <div>
                    <strong>{customer.customerName}</strong>
                    <span>{customer.bookingCount} rezerv</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {filteredCustomers.length === 0 ? (
        <section className="business-customers__empty">
          <div className="business-customers__empty-icon">
            <Users size={24} strokeWidth={1.8} />
          </div>

          <h2>
            {customers.length === 0
              ? "Hələ müştəriniz yoxdur"
              : "Axtarışa uyğun müştəri tapılmadı"}
          </h2>

          <p>
            {customers.length === 0
              ? "Müştərilər rezerv etdikcə burada görünəcək."
              : "Başqa ad ilə axtarmağı sınayın."}
          </p>
        </section>
      ) : (
        <section className="business-customers__list">
          {filteredCustomers.map((customer) => {
            const initials = customer.customerName
              .split(" ")
              .map((word) => word[0])
              .slice(0, 2)
              .join("");

            return (
              <article
                key={customer.customerId}
                className="business-customer-card"
              >
                <div className="business-customer-card__top">
                  <div className="business-customer-card__avatar">
                    {initials}
                  </div>

                  <div className="business-customer-card__name">
                    <h3>{customer.customerName}</h3>

                    <span>
                      Son rezerv: {formatDate(customer.lastBookingDate)}
                    </span>
                  </div>

                  <div
                    className={`business-customer-card__status business-customer-card__status--${customer.lastStatus.toLowerCase()}`}
                  >
                    {(customer.lastStatus === "CONFIRMED" ||
                      customer.lastStatus === "COMPLETED") && (
                      <CheckCircle2 size={14} strokeWidth={1.9} />
                    )}

                    {customer.lastStatus === "CANCELLED" && (
                      <XCircle size={14} strokeWidth={1.9} />
                    )}

                    {statusLabels[customer.lastStatus]}
                  </div>
                </div>

                <div className="business-customer-card__stats">
                  <div className="business-customer-card__stat">
                    <CalendarDays size={16} strokeWidth={1.8} />

                    <div>
                      <span>Ümumi rezerv</span>
                      <strong>{customer.bookingCount}</strong>
                    </div>
                  </div>

                  <div className="business-customer-card__stat">
                    <CheckCircle2 size={16} strokeWidth={1.8} />

                    <div>
                      <span>Aktiv</span>
                      <strong>{customer.activeCount}</strong>
                    </div>
                  </div>

                  <div className="business-customer-card__stat">
                    <Wallet size={16} strokeWidth={1.8} />

                    <div>
                      <span>Ümumi ödəniş</span>
                      <strong>{customer.totalSpent} ₼</strong>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default BusinessCustomers;