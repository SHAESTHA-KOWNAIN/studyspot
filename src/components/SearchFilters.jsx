import { Search, SlidersHorizontal, X } from "lucide-react";

export default function SearchFilters({ filters, onChange, onClear, options }) {
  const hasFilters = Object.values(filters).some(Boolean);
  return (
    <section className="filter-panel" aria-label="Search and filter study spaces">
      <div className="search-field">
        <Search size={18} aria-hidden="true" />
        <label className="sr-only" htmlFor="space-search">Search spaces</label>
        <input id="space-search" value={filters.search} onChange={(event) => onChange("search", event.target.value)} placeholder="Search by space, building, or area..." />
      </div>
      <div className="filter-heading"><SlidersHorizontal size={16} /> Refine results</div>
      <div className="filter-grid">
        <label>Building<select value={filters.building} onChange={(event) => onChange("building", event.target.value)}><option value="">All buildings</option>{options.buildings.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Area<select value={filters.area} onChange={(event) => onChange("area", event.target.value)}><option value="">All areas</option>{options.areas.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Availability<select value={filters.status} onChange={(event) => onChange("status", event.target.value)}><option value="">Any status</option>{options.statuses.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Facilities<select value={filters.facility} onChange={(event) => onChange("facility", event.target.value)}><option value="">Any facility</option>{options.facilities.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Quiet zone<select value={filters.quietZone} onChange={(event) => onChange("quietZone", event.target.value)}><option value="">Any</option><option value="true">Quiet zone</option><option value="false">Not a quiet zone</option></select></label>
        <label>Group study<select value={filters.groupStudyAllowed} onChange={(event) => onChange("groupStudyAllowed", event.target.value)}><option value="">Any</option><option value="true">Suitable</option><option value="false">Not suitable</option></select></label>
      </div>
      {hasFilters && <button className="button button-quiet clear-filters" type="button" onClick={onClear}><X size={15} /> Clear all filters</button>}
    </section>
  );
}
