<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Barra estilo wp-admin -->
    <q-header v-if="store.adminBar" class="wp-admin-bar text-white">
      <q-toolbar dense>
        <q-icon name="grid_view" class="q-mr-sm" />
        <span class="text-caption text-bold">{{ store.theme.brandName }}</span>
        <q-separator vertical dark class="q-mx-sm" />
        <q-btn
          flat
          dense
          no-caps
          size="sm"
          icon="dashboard"
          label="CMS"
          to="/admin"
        />
        <q-btn
          flat
          dense
          no-caps
          size="sm"
          icon="backup"
          label="Backups"
          to="/backups"
        />
        <q-btn
          flat
          dense
          no-caps
          size="sm"
          icon="palette"
          label="Personalizar"
          @click="store.customizerOpen = true"
        />
        <q-space />
        <q-btn
          flat
          dense
          round
          size="sm"
          icon="visibility_off"
          @click="store.adminBar = false"
        >
          <q-tooltip>Ocultar barra de admin</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Cabecera del sitio -->
    <q-header
      :class="headerClass"
      :elevated="store.theme.headerStyle !== 'minimalista'"
    >
      <q-toolbar>
        <q-toolbar-title
          class="text-bold"
          :class="{ 'text-center': store.theme.headerStyle === 'ejecutivo' }"
        >
          {{ store.theme.brandName }}
        </q-toolbar-title>
        <div
          v-if="store.theme.headerStyle !== 'minimalista'"
          class="row q-gutter-xs"
        >
          <q-btn flat no-caps label="Inicio" to="/" />
          <q-btn
            flat
            no-caps
            label="Servicios"
            @click="scrollTo('servicios')"
          />
          <q-btn flat no-caps label="Casos" @click="scrollTo('casos')" />
          <q-btn flat no-caps label="Blog" @click="scrollTo('blog')" />
          <q-btn flat no-caps label="Contacto" @click="scrollTo('contacto')" />
        </div>
      </q-toolbar>
    </q-header>

    <ThemeCustomizer />

    <q-page-container :style="siteStyle">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ThemeCustomizer from "@/components/ThemeCustomizer.vue";
import { useCmsStore } from "@/stores/cms";

const store = useCmsStore();

const headerClass = computed(() => {
  switch (store.theme.headerStyle) {
    case "minimalista":
      return "bg-white text-dark";
    case "ejecutivo":
      return "bg-black text-white";
    default:
      return "site-header text-white";
  }
});

const siteStyle = computed(() => ({
  "--brand": store.theme.primaryColor,
  fontFamily:
    store.theme.fontFamily === "serif"
      ? "Georgia, 'Times New Roman', serif"
      : store.theme.fontFamily === "mono"
        ? "'JetBrains Mono', monospace"
        : "Roboto, sans-serif"
}));

function scrollTo(id: string) {
  setTimeout(
    () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
    50
  );
}
</script>

<style>
.wp-admin-bar {
  background: #1d2327;
  position: relative;
}
.site-header {
  background: var(--brand, #1d4ed8);
}
</style>
