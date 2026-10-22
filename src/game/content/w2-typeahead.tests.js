const { createSearch } = exports;

test('waits `delay` ms before calling the API', async () => {
  const api = spy(async (q) => [q]);
  const search = createSearch(api, 300);
  search('a');
  await clock.tick(299);
  expect(api.callCount).toBe(0);
  await clock.tick(1);
  expect(api.callCount).toBe(1);
});

test('resolves with the results for the query', async () => {
  const api = spy(async (q) => [`${q}!`]);
  const search = createSearch(api, 100);
  const promise = search('cat');
  await clock.tick(100);
  expect(await promise).toEqual(['cat!']);
});

test('typing fast only hits the API for the final query', async () => {
  const api = spy(async (q) => [q]);
  const search = createSearch(api, 300);
  search('h');
  await clock.tick(100);
  search('he');
  await clock.tick(100);
  const last = search('hel');
  await clock.tick(300);
  expect(api.calls).toEqual([['hel']]);
  expect(await last).toEqual(['hel']);
});

test('superseded searches resolve with null', async () => {
  const api = spy(async (q) => [q]);
  const search = createSearch(api, 300);
  const first = search('a');
  await clock.tick(100);
  search('ab');
  await clock.tick(300);
  expect(await first).toBeNull();
});

test('a slow old response never overwrites a newer one', async () => {
  const api = (q) => sleep(q === 'slow' ? 1000 : 100).then(() => [q]);
  const search = createSearch(api, 300);
  const slow = search('slow');
  await clock.tick(300);   // "slow" request is now in flight (answers at +1000)
  const fast = search('fast');
  await clock.tick(300);   // "fast" request fires
  await clock.tick(100);   // ...and answers first
  expect(await fast).toEqual(['fast']);
  await clock.tick(1000);  // the stale response finally arrives
  expect(await slow).toBeNull();
});

test('rejects when the latest request fails', async () => {
  const api = async () => { throw new Error('API down'); };
  const search = createSearch(api, 100);
  const assertion = rejects(search('x'));
  await clock.tick(100);
  const error = await assertion;
  expect(error.message).toBe('API down');
});
