export function toneFromAlert(alertLevel = 'green') {
  if (alertLevel === 'red') {
    return 'danger'
  }

  if (alertLevel === 'amber') {
    return 'warning'
  }

  return 'safe'
}

export function toPrettyDensity(value = 'low') {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function statCardsFromZones(zones) {
  if (!zones.length) {
    return [
      { value: '0', label: 'Active Zones', tone: 'light' },
      { value: '0m', label: 'Peak Queue', tone: 'orange' },
      { value: '0', label: 'Critical Zones', tone: 'lime' },
    ]
  }

  const maxQueue = zones.reduce((max, zone) => Math.max(max, zone.queueMinutes || 0), 0)
  const criticalCount = zones.filter((zone) => zone.alertLevel === 'red').length

  return [
    { value: String(zones.length), label: 'Active Zones', tone: 'light' },
    { value: `${maxQueue}m`, label: 'Peak Queue', tone: 'orange' },
    { value: String(criticalCount), label: 'Critical Zones', tone: 'lime' },
  ]
}
