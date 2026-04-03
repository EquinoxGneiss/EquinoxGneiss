<template>
  <div class="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
    <!-- Background blobs -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative">
      <!-- Logo -->
      <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-600/30">
        <span class="text-3xl">⚡</span>
      </div>

      <h1 class="text-5xl font-extrabold text-white mb-3 tracking-tight">Folio</h1>
      <p class="text-gray-400 text-lg mb-10 max-w-sm mx-auto leading-relaxed">
        Your personal portfolio, powered by Vue.js.<br />Build yours in minutes.
      </p>

      <a
        href="/admin"
        class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-purple-600/30 text-sm"
      >
        Manage your portfolio
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  </div>
</template>
