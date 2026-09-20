// Fetch every authorized row without silently truncating at the API's page limit.
// Each page is still independently checked by Postgres RLS.
export async function fetchRows<T>(
  page: (
    start: number,
    end: number,
  ) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
) {
  const rows: T[] = [];
  for (let start = 0; ; start += 500) {
    const result = await page(start, start + 499);
    if (result.error) return { data: null, error: result.error };
    rows.push(...(result.data || []));
    if ((result.data?.length || 0) < 500) return { data: rows, error: null };
  }
}
