import { useEffect, useState } from 'react'
import { getConfig, uploadBackground, uploadBackgroundOther, uploadLogo } from '../../api/ninnoClient'
import type { NinnoAppConfig } from '../../types'
import ImageUploadCard from '../../components/ninno/ImageUploadCard'

export default function AppearancePage() {
  const [config, setConfig] = useState<NinnoAppConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getConfig()
      .then(setConfig)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-gray-400 text-sm">Chargement...</p>
  if (!config) return <p className="text-red-400 text-sm">Impossible de charger la configuration.</p>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <ImageUploadCard
        title="Image de fond (Accueil)"
        description="Fond affiché sur l'écran d'accueil de l'application."
        currentUrl={config.backgroundImageUrl}
        onUpload={async (file) => {
          const updated = await uploadBackground(file)
          setConfig(updated)
        }}
      />
      <ImageUploadCard
        title="Image de fond (Autres pages)"
        description="Fond affiché sur tous les autres écrans de l'application."
        currentUrl={config.backgroundOtherImageUrl}
        onUpload={async (file) => {
          const updated = await uploadBackgroundOther(file)
          setConfig(updated)
        }}
      />
      <ImageUploadCard
        title="Logo"
        description="Logo affiché en haut au centre de l'application."
        currentUrl={config.logoImageUrl}
        onUpload={async (file) => {
          const updated = await uploadLogo(file)
          setConfig(updated)
        }}
      />
    </div>
  )
}
