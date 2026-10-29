import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { getSpaces } from "../api/spacesApi.js";
import { getSpaceReports } from "../api/reportsApi.js";
import { REPORT_STATUSES } from "../utils/statusUtils.js";
import SearchFilters from "../components/SearchFilters.jsx";
import SpaceCard from "../components/SpaceCard.jsx";
import LoadingState from "../components/LoadingState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import EmptyState from "../components/EmptyState.jsx";

const initialFilters = { search: "", building: "", area: "", status: "", facility: "", quietZone: "", groupStudyAllowed: "" };

export default function SpacesPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [spaces, setSpaces] = useState([]);
  const [catalogSpaces, setCatalogSpaces] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSpaces = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [results, catalog] = await Promise.all([getSpaces(filters), getSpaces()]);
      setSpaces(results);
      setCatalogSpaces(catalog);
      const grouped = await Promise.all(results.map((space) => getSpaceReports(space.id)));
      setReports(grouped.flat());
    } catch (loadError) {
      setError(loadError.message || "Study spaces could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadSpaces(); }, [loadSpaces]);
  const options = useMemo(() => ({
    buildings: [...new Set(catalogSpaces.map((space) => space.building))].sort(),
    areas: [...new Set(catalogSpaces.map((space) => space.area))].sort(),
    facilities: [...new Set(catalogSpaces.flatMap((space) => space.facilities))].sort(),
    statuses: REPORT_STATUSES,
  }), [catalogSpaces]);
  const onChange = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const clearFilters = () => setFilters(initialFilters);

  return (
    <div className="container page-container">
      <div className="page-heading directory-heading">
        <div><span className="eyebrow"><MapPin size={14} /> Your campus, in one place</span><h1>Find a study space</h1><p>Explore campus study areas and see the latest updates shared by students.</p></div>
        {!loading && !error && <span className="results-count">{spaces.length} {spaces.length === 1 ? "space" : "spaces"}</span>}
      </div>
      <SearchFilters filters={filters} onChange={onChange} onClear={clearFilters} options={options} />
      {loading ? <LoadingState label="Finding spaces..." /> : error ? <ErrorState message={error} onRetry={loadSpaces} /> : spaces.length === 0 ? <EmptyState title="No spaces match those filters">Try another search or clear some filters to see more campus spaces.</EmptyState> : (
        <div className="space-grid">{spaces.map((space) => <SpaceCard key={space.id} space={space} reports={reports.filter((report) => report.spaceId === space.id)} />)}</div>
      )}
      {!loading && !error && <p className="directory-note">Availability updates come from the StudySpot community. Always check posted space rules.</p>}
    </div>
  );
}
