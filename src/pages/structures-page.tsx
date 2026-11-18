import { StructureSearch } from '@/features/structures/structure-search'

export function StructuresPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Annuaire</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Structures d’accompagnement
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Recherchez parmi les structures SAEI publiées au Bénin, au Sénégal et
          en Côte d’Ivoire par mot-clé, pays, ville, typologie, public cible ou stade.
        </p>
      </div>

      <StructureSearch />
    </div>
  )
}
