'use client';

export function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
        <h2 className="text-red-800 text-xl font-bold mb-4">Hintatietojen Lataaminen Epäonnistui</h2>
        <p className="text-red-700 mb-4">{message}</p>
        <p className="text-gray-700 text-sm">
          Yritä myöhemmin uudelleen tai ota yhteyttä tukeen, jos ongelma jatkuu.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
        >
          Yritä Uudelleen
        </button>
      </div>
    </div>
  );
}