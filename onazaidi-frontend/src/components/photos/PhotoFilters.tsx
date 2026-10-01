import type { PhotoFilter } from "@/types/photo";
import type { Destination } from "@/types/destination";

interface Props {
  filter: PhotoFilter;
  onChange: (next: PhotoFilter) => void;
  destinations: Destination[];
}

export function PhotoFilters({ filter, onChange, destinations }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg bg-gray-50 p-4">
      <div className="flex-1 min-w-[150px] sm:min-w-[200px]">
        <label className="label">Search</label>
        <input
          type="text"
          value={filter.search ?? ""}
          onChange={(e) => onChange({ ...filter, search: e.target.value, page: 0 })}
          placeholder="Search photographs..."
          className="input"
        />
      </div>

      <div className="min-w-[140px] sm:min-w-[180px]">
        <label className="label">Destination</label>
        <select
          className="input"
          value={filter.destinationId ?? ""}
          onChange={(e) =>
            onChange({
              ...filter,
              destinationId: e.target.value || undefined,
              page: 0,
            })
          }
        >
          <option value="">All destinations</option>
          {destinations.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-[120px] sm:min-w-[160px]">
        <label className="label">Sort</label>
        <select
          className="input"
          value={filter.sort ?? "latest"}
          onChange={(e) =>
            onChange({ ...filter, sort: e.target.value as PhotoFilter["sort"], page: 0 })
          }
        >
          <option value="latest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="price_asc">Price: low → high</option>
          <option value="price_desc">Price: high → low</option>
        </select>
      </div>

      <div className="flex gap-2 sm:gap-3">
        <div>
          <label className="label">Min</label>
          <input
            type="number"
            min={0}
            className="input w-20 sm:w-24"
            value={filter.minPrice ?? ""}
            onChange={(e) =>
              onChange({
                ...filter,
                minPrice: e.target.value ? Number(e.target.value) : undefined,
                page: 0,
              })
            }
          />
        </div>
        <div>
          <label className="label">Max</label>
          <input
            type="number"
            min={0}
            className="input w-20 sm:w-24"
            value={filter.maxPrice ?? ""}
            onChange={(e) =>
              onChange({
                ...filter,
                maxPrice: e.target.value ? Number(e.target.value) : undefined,
                page: 0,
              })
            }
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => onChange({ page: 0, size: filter.size, sort: "latest" })}
        className="btn-secondary"
      >
        Reset
      </button>
    </div>
  );
}
