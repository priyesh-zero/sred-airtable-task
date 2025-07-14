import { ColDef } from "ag-grid-community";

export interface FlattenedObject {
  [key: string]: any;
}

/**
 * Recursively flattens a nested object including arrays.
 * Example:
 * {
 *   a: { b: { c: 1 } },
 *   d: [{ e: 2 }]
 * }
 * becomes:
 * {
 *   'a.b.c': 1,
 *   'd[0].e': 2
 * }
 */
export function flattenObject(
  obj: Record<string, any>,
  parentKey = '',
  result: FlattenedObject = {},
  keysToSkip: string[] = []
): FlattenedObject {
  Object.entries(obj).forEach(([key, value]) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    if (keysToSkip.includes(key)) {
      // Don't flatten this key — just assign it directly to top level or parent level
      result[fullKey] = value;
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const arrayKey = `${fullKey}[${index}]`;
        if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
          flattenObject(item, arrayKey, result, keysToSkip);
        } else {
          result[arrayKey] = item;
        }
      });
    } else if (value !== null && typeof value === 'object') {
      flattenObject(value, fullKey, result, keysToSkip);
    } else {
      result[fullKey] = value;
    }
  });

  return result;
}

/**
 * Converts a flattened path to a user-friendly header.
 * Example: "commit.author.name" → "Commit Author Name"
 */
export function formatHeaderName(path: string): string {
  return path
    .replace(/\[(\d+)\]/g, ' $1') // e.g. "parents[0]" → "parents 0"
    .split(/[.\s]/) // split by dots and spaces
    .flatMap(segment =>
      segment
        .split(/[-_]/) // further split hyphen and underscore
        .filter(Boolean) // remove empty
    )
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getAllUniqueKeys(
  records: Record<string, any>[],
  keysToSkip: string[] = []
): string[] {
  const skipSet = new Set(keysToSkip);

  return Array.from(
    new Set(
      records.flatMap(record =>
        Object.keys(record).filter(key => !skipSet.has(key))
      )
    )
  );
}

export function generateFlatColumnDefs(
  data: any[],
  keysToExclude: string[] = []
): ColDef[] {
  if (!data?.length) return [];
  const allKeys = getAllUniqueKeys(data, keysToExclude);

  const dynamicColumns: ColDef[] = allKeys
    .map((key) => {
      return {
        field: key,
        headerName: formatHeaderName(key),
        resizable: true,
        sortable: true,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        flex: 1,
        minWidth: 250,
        tooltipField: key,
        valueGetter: (params: any) => params.data?.[key],
        cellRenderer: (params: any) => {
          const val = params.value;
          const isImage = typeof val === 'string' && val.includes('avatar');
          const isUrl = typeof val === 'string' && /^https?:\/\//.test(val) && !isImage;
          const isEnabledField =
            typeof val === 'string' &&
            (val.toLowerCase() === 'enabled' || val.toLowerCase() === 'disabled');
          const isBoolean = typeof val === 'boolean';

          if (val === undefined || val === null) return '';

          // Enabled pill
          if (isEnabledField) {
            const isEnabled = val.toLowerCase() === 'enabled';
            const color = isEnabled ? '#89ad8b' : '#dd7f79';
            const label = isEnabled ? 'Enabled' : 'Disabled';
            return `
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="width:12px; height:12px; border-radius:50%; background-color:${color}; display:inline-block;"></span>
                <span>${label}</span>
              </span>
            `;
          }

          // Boolean checkbox
          if (isBoolean) {
            return `<input type="checkbox" disabled ${val ? 'checked' : ''} style="accent-color: #4caf50;" />`;
          }

          // Avatar image
          if (isImage) {
            return `<img src="${val}" alt="avatar" style="width: 32px; height: 32px; border-radius: 50%;" />`;
          }

          // URL link
          if (isUrl) {
            return `<a href="${val}" target="_blank" style="text-decoration: none; color: #1976d2;">${val}</a>`;
          }

          // Fallback
          return val;
        }

      };
    });

  return dynamicColumns;
}


