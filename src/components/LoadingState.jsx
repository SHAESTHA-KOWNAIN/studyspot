export default function LoadingState({ label = "Loading..." }) {
  return <div className="state-panel" role="status"><span className="spinner" aria-hidden="true" />{label}</div>;
}
