export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>{title}</h2>
      <p style={{ color: 'var(--gx2-texto-secundario)' }}>Em desenvolvimento.</p>
    </div>
  );
}
