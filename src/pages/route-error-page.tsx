import { AlertTriangleIcon } from 'lucide-react'
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function RouteErrorPage() {
  const error = useRouteError()

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Une erreur inattendue est survenue.'

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-xl flex-col justify-center px-4 py-16">
      <Card>
        <CardHeader className="items-center text-center">
          <AlertTriangleIcon className="mb-2 size-10 text-destructive" />
          <CardTitle>Quelque chose s’est mal passé</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-2">
          <Link to="/" className={buttonVariants()}>
            Retour à l’accueil
          </Link>
          <button
            type="button"
            className={buttonVariants({ variant: 'outline' })}
            onClick={() => window.location.reload()}
          >
            Recharger
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
