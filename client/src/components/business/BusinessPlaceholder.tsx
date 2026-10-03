interface BusinessPlaceholderProps {
  title: string;
}

function BusinessPlaceholder({ title }: BusinessPlaceholderProps) {
  return (
    <main style={{ maxWidth: 1040, margin: "0 auto", padding: "28px 20px" }}>
      <h1 style={{ margin: 0, color: "var(--color-text)", fontSize: 26 }}>
        {title}
      </h1>
      <p style={{ color: "var(--color-text-secondary)" }}>
        Bu bölmə tezliklə əlavə olunacaq.
      </p>
    </main>
  );
}

export default BusinessPlaceholder;