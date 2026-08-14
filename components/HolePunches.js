export default function HolePunches() {
  return (
    <div className="mh-holes" aria-hidden="true">
      {[...Array(9)].map((_, i) => (
        <div className="mh-hole" key={i} />
      ))}
    </div>
  );
}
