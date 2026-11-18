import { CompassIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col px-4 py-16">
      <Card>
        <CardHeader className="items-center text-center">
          <CompassIcon className="mb-2 size-10 text-muted-foreground" />
          <CardTitle>Page introuvable</CardTitle>
          <CardDescription>
            La page que vous cherchez n’existe pas ou a été déplacée.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link to="/" className={buttonVariants()}>
            Retour à l’accueil
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
