const TRANSLATE_ENDPOINT = 'https://translation.googleapis.com/language/translate/v2'

function translationDocId(text, locale) {
  return `${locale}::${Buffer.from(text).toString('base64url')}`
}

async function translateText(text, locale, apiKey) {
  const url = `${TRANSLATE_ENDPOINT}?key=${encodeURIComponent(apiKey)}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      q: text,
      target: locale,
      format: 'text',
    }),
  })

  if (!response.ok) {
    throw new Error(`translate request failed (${response.status})`)
  }

  const payload = await response.json()
  const translatedText = payload?.data?.translations?.[0]?.translatedText

  if (!translatedText) {
    throw new Error('translate response missing translatedText')
  }

  return translatedText
}

async function getOrCreateTranslation({
  db,
  sourceText,
  locale,
  apiKey,
  admin,
  allowExternalApis,
}) {
  if (locale === 'en') {
    return sourceText
  }

  const allowedLocales = new Set(['es', 'fr', 'hi'])
  if (!allowedLocales.has(locale)) {
    return sourceText
  }

  const docId = translationDocId(sourceText, locale)
  const ref = db.collection('translations').doc(docId)
  const existing = await ref.get()
  if (existing.exists) {
    return existing.data().text
  }

  if (!allowExternalApis || !apiKey) {
    return sourceText
  }

  try {
    const translated = await translateText(sourceText, locale, apiKey)
    await ref.set({
      key: docId,
      locale,
      sourceText,
      text: translated,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    return translated
  } catch (_) {
    return sourceText
  }
}

async function buildLocalizedMessages({
  db,
  baseMessage,
  locales,
  apiKey,
  admin,
  allowExternalApis,
}) {
  const entries = await Promise.all(
    locales.map(async (locale) => {
      const text = await getOrCreateTranslation({
        db,
        sourceText: baseMessage,
        locale,
        apiKey,
        admin,
        allowExternalApis,
      })

      return [locale, text]
    }),
  )

  return Object.fromEntries(entries)
}

module.exports = {
  buildLocalizedMessages,
}
