import HolePunches from "@/components/HolePunches";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="mh-root">
      <HolePunches />
      <div className="mh-page mh-auth-page">
        <h1 className="mh-h1">{title}</h1>
        {subtitle && <p className="mh-subtle">{subtitle}</p>}
        <div className="mh-card mh-auth-card">{children}</div>
      </div>
    </div>
  );
}
