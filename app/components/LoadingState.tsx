export function LoadingState({ label, fullscreen = false }: { label: string; fullscreen?: boolean }) {
  return <div className={`loading-state ${fullscreen ? "fullscreen" : "compact"}`} role="status" aria-live="polite">
    <div className="loading-emblem" aria-hidden="true">
      <span className="loading-globe"><i /><b /></span>
      <span className="loading-pin" />
    </div>
    {fullscreen && <div className="logo loading-logo"><span>MUNDO</span>QUIZ</div>}
    <p>{label}</p>
    <div className="loading-dots" aria-hidden="true"><i /><i /><i /></div>
  </div>;
}
