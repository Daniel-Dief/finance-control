import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  function clearCache() {
    localStorage.clear();
    window.location.reload();
  }

  return (
    <DefaultLayout>
      Hello, World!
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={clearCache}
      >
        Limpar cache
      </button>
    </DefaultLayout>
  );
}
