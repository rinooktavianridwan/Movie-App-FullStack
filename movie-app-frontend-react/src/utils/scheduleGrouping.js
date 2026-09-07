const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export function scheduleDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function groupSchedulesByDateAndStudio(schedules = []) {
  const groupsByKey = new Map();

  schedules.forEach((sched) => {
    const key = scheduleDateKey(sched.date);
    if (!key) return;

    if (!groupsByKey.has(key)) {
      groupsByKey.set(key, { key, date: sched.date, studios: new Map() });
    }

    const group = groupsByKey.get(key);
    const studioId = sched.studio?.id ?? sched.studio_id ?? 'unknown';

    if (!group.studios.has(studioId)) {
      group.studios.set(studioId, {
        id: studioId,
        name: sched.studio?.name || 'Studio',
        schedules: [],
      });
    }

    group.studios.get(studioId).schedules.push(sched);
  });

  return [...groupsByKey.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((group) => ({
      key: group.key,
      date: group.date,
      studios: [...group.studios.values()]
        .sort((a, b) => new Date(a.schedules[0].start_time) - new Date(b.schedules[0].start_time))
        .map((studio) => ({
          ...studio,
          schedules: [...studio.schedules].sort(
            (a, b) => new Date(a.start_time) - new Date(b.start_time)
          ),
        })),
    }));
}

export function getDateDisplayInfo(dateValue, today = new Date()) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return { label: '', tag: '' };
  }

  const label = date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const diffDays = Math.round((startOfDay(date) - startOfDay(today)) / 86400000);
  const tag = diffDays === 0 ? 'Hari Ini' : diffDays === 1 ? 'Besok' : '';

  return { label, tag };
}
