// styles/timeTracker.ts

export const styles = {
    container: "max-w-6xl mx-auto",
    title: "text-3xl font-bold mb-6",

    inputSection: "mb-8 p-4 bg-white rounded-lg shadow",
    inputGrid: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4",
    input: "p-2 border rounded w-full",
    categorySelect: "p-2 border rounded w-full bg-white",
    customCategoryInput: "mt-2 p-2 border rounded w-full",

    startButton: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors",
    stopButton: "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors",

    activeEntryContainer: "mb-8 p-8 bg-green-100 rounded-lg text-center",
    activeEntryTitle: "text-xl font-semibold mb-4",
    timerDisplay: "text-6xl font-mono font-bold mb-6 text-green-700",
    activeEntryDetails: "text-lg",
    activeEntryLabel: "font-semibold",

    distributionSection: "mb-8",
    distributionTitle: "text-2xl font-semibold mb-4",
    chartContainer: "h-96",

    summaryGrid: "grid grid-cols-1 md:grid-cols-2 gap-4",
    summaryCard: "p-4 bg-white rounded-lg shadow",
    summaryTitle: "text-xl font-semibold mb-2",
    summaryText: "whitespace-pre-line"
} as const