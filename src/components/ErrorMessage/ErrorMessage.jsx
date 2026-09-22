export default function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div className="border-l-4 border-primary bg-sand px-4 py-3 text-sm text-ink">
      {message}
    </div>
  );
}