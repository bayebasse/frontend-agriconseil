export default function Loading({ children = "Chargement…" }) {
  return (
    <div className="mx-auto w-full max-w-[1180px] rounded-[10px] border border-earth bg-sand p-12 text-center text-muted">
      {children}
    </div>
  );
}