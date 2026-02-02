import { Outlet, Link } from 'react-router-dom'

function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white py-4 px-6 shadow-md">
        <Link to="/" className="block">
          <h1 className="text-2xl font-bold text-center hover:opacity-90 transition-opacity">
            MiniGame Collection
          </h1>
        </Link>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
