<template>
  <q-drawer
    :model-value="store.customizerOpen"
    side="right"
    overlay
    bordered
    :width="340"
    @update:model-value="v => (store.customizerOpen = v)"
  >
    <div class="q-pa-md">
      <div class="row items-center q-mb-md">
        <q-icon name="palette" color="primary" class="q-mr-sm" />
        <div class="text-subtitle1 text-bold">Personalizador de tema</div>
        <q-space />
        <q-btn
          flat
          round
          dense
          icon="close"
          @click="store.customizerOpen = false"
        />
      </div>

      <q-input
        v-model="store.theme.brandName"
        label="Nombre de marca"
        filled
        dense
        class="q-mb-md"
        @update:model-value="store.persist()"
      />

      <div class="text-caption text-grey-7 q-mb-xs">Color principal</div>
      <div class="row q-gutter-xs q-mb-md">
        <div
          v-for="c in palette"
          :key="c"
          class="swatch"
          :class="{ active: store.theme.primaryColor === c }"
          :style="{ background: c }"
          @click="set({ primaryColor: c })"
        />
      </div>

      <q-select
        :model-value="store.theme.headerStyle"
        :options="['corporativo', 'minimalista', 'ejecutivo']"
        label="Estilo de cabecera"
        filled
        dense
        class="q-mb-md"
        @update:model-value="
          v => set({ headerStyle: v as ThemeConfig['headerStyle'] })
        "
      />
      <q-select
        :model-value="store.theme.heroLayout"
        :options="['centrado', 'izquierda', 'imagen-fondo']"
        label="Layout del hero"
        filled
        dense
        class="q-mb-md"
        @update:model-value="
          v => set({ heroLayout: v as ThemeConfig['heroLayout'] })
        "
      />
      <q-select
        :model-value="store.theme.fontFamily"
        :options="['Roboto', 'serif', 'mono']"
        label="Tipografía"
        filled
        dense
        class="q-mb-md"
        @update:model-value="
          v => set({ fontFamily: v as ThemeConfig['fontFamily'] })
        "
      />
      <q-toggle
        :model-value="store.theme.showTopBar"
        label="Barra superior corporativa"
        @update:model-value="v => set({ showTopBar: !!v })"
      />

      <q-separator class="q-my-md" />
      <div class="text-caption text-grey-6">
        Todos los cambios se aplican en vivo y se guardan localmente. Crea un
        snapshot en <b>Backups</b> para congelar esta versión.
      </div>
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
import { useCmsStore } from "@/stores/cms";
import type { ThemeConfig } from "@/lib/cms";

const store = useCmsStore();
const palette = [
  "#1d4ed8",
  "#0f766e",
  "#7c3aed",
  "#b45309",
  "#be123c",
  "#334155"
];

function set(patch: Partial<ThemeConfig>) {
  Object.assign(store.theme, patch);
  store.persist();
}
</script>

<style scoped>
.swatch {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
}
.swatch.active {
  border-color: #0f172a;
  transform: scale(1.1);
}
</style>
