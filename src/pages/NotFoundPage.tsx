import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="text-center py-12">
      <h2 className="text-4xl font-bold text-gray-800 mb-4">404</h2>
      <p className="text-gray-600 mb-6">ページが見つかりません</p>
      <Link
        to="/"
        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg
                   hover:bg-blue-700 transition-colors duration-200
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        ホームに戻る
      </Link>
    </div>
  )
}

export default NotFoundPage
