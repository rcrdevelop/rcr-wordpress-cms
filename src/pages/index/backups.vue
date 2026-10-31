<template>
  <q-page class="bg-grey-1 q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Panel del plugin -->
      <div class="col-12 col-md-5">
        <q-card flat bordered class="q-pa-md">
          <div class="text-h6 q-mb-xs">
            <q-icon name="backup" color="primary" class="q-mr-sm" />RCR Backup &
            Sync
          </div>
          <div class="text-caption text-grey-7 q-mb-md">
            Simulador del plugin de migración: empaqueta tema, páginas y posts
            en un snapshot descargable con checksum.
          </div>

          <q-option-group
            v-model="env"
            :options="[
              { label: 'production', value: 'production' },
              { label: 'staging', value: 'staging' }
            ]"
            inline
            class="q-mb-sm"
          />

          <div
            class="bg-grey-2 rounded-borders q-pa-sm q-mb-md mono text-caption"
          >
            <div>tamaño actual: {{ store.snapshotSize }} bytes</div>
            <div>checksum en vivo: {{ liveChecksum }}</div>
          </div>

          <q-btn
            color="primary"
            icon="add_to_photos"
            label="Crear snapshot"
            no-caps
            :loading="creating"
            @click="create"
          />
          <q-btn
            flat
            icon="upload_file"
            label="Restaurar desde archivo"
            no-caps
            class="q-ml-sm"
            @click="fileInput?.click()"
          />
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            hidden
            @change="importFile"
          />

          <q-linear-progress v-if="creating" indeterminate class="q-mt-sm" />
        </q-card>
      </div>

      <!-- Historial -->
      <div class="col-12 col-md-7">
        <q-card flat bordered class="q-pa-md">
          <div class="text-h6 q-mb-md"
            >Historial de snapshots ({{ store.backups.length }})</div
          >
          <q-list separator v-if="store.backups.length">
            <q-item v-for="b in store.backups" :key="b.id">
              <q-item-section avatar>
                <q-icon
                  name="inventory_2"
                  :color="
                    b.environment === 'production' ? 'negative' : 'warning'
                  "
                />
              </q-item-section>
              <q-item-section>
                <q-item-label class="mono"
                  >{{ b.id }}
                  <q-badge
                    :label="b.environment"
                    :color="
                      b.environment === 'production' ? 'negative' : 'warning'
                    "
                /></q-item-label>
                <q-item-label caption>
                  {{ new Date(b.createdAt).toLocaleString("es-ES") }} ·
                  {{ (b.sizeBytes / 1024).toFixed(1) }} KB · #{{ b.checksum }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="row">
                  <q-btn dense flat icon="download" @click="download(b)">
                    <q-tooltip>Descargar .json</q-tooltip>
                  </q-btn>
                  <q-btn dense flat icon="code" @click="inspect(b)">
                    <q-tooltip>Ver manifiesto</q-tooltip>
                  </q-btn>
                  <q-btn
                    dense
                    flat
                    icon="restore"
                    color="primary"
                    @click="restore(b)"
                  >
                    <q-tooltip>Restaurar esta versión</q-tooltip>
                  </q-btn>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
          <div v-else class="text-center text-grey-6 q-pa-lg">
            <q-icon name="inventory_2" size="42px" />
            <div
              >Sin snapshots. Crea el primero para congelar la configuración
              actual.</div
            >
          </div>
        </q-card>
      </div>
    </div>

    <!-- Visor de manifiesto -->
    <q-dialog v-model="viewer">
      <q-card style="max-width: 640px; width: 100%">
        <q-card-section class="row items-center">
          <div class="text-subtitle1">Manifiesto del snapshot</div>
          <q-space />
          <q-btn flat round dense icon="close" @click="viewer = false" />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <pre class="manifest">{{ viewing }}</pre>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useQuasar } from "quasar";
import { useCmsStore } from "@/stores/cms";
import { checksum, downloadText, siteSnapshot, type Backup } from "@/lib/cms";

const store = useCmsStore();
const $q = useQuasar();

const env = ref<"production" | "staging">("staging");
const creating = ref(false);
const viewer = ref(false);
const viewing = ref("");
const fileInput = ref<HTMLInputElement | null>(null);

const liveChecksum = computed(() =>
  checksum(siteSnapshot(store.theme, store.pages, store.posts))
);

async function create() {
  creating.value = true;
  await new Promise(r => setTimeout(r, 1100)); // progreso simulado
  store.createBackup(env.value);
  creating.value = false;
  $q.notify({ type: "positive", message: "Snapshot creado" });
}

function download(b: Backup) {
  downloadText(b.snapshot, `${b.id}.json`);
}
function inspect(b: Backup) {
  viewing.value = b.snapshot;
  viewer.value = true;
}
function restore(b: Backup) {
  $q.dialog({
    title: "Restaurar snapshot",
    message: `Se sobrescribirá tema, páginas y posts con la versión ${b.id}. ¿Continuar?`,
    cancel: true
  }).onOk(() => {
    store.restoreBackup(b.id);
    $q.notify({ type: "positive", message: "Versión restaurada" });
  });
}
function importFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    const ok = store.importSnapshot(String(r.result ?? ""));
    $q.notify({
      type: ok ? "positive" : "negative",
      message: ok ? "Snapshot importado y aplicado" : "Archivo no válido"
    });
  };
  r.readAsText(f);
}
</script>

<style scoped>
.mono {
  font-family: monospace;
}
.manifest {
  max-height: 50vh;
  overflow: auto;
  font-size: 11px;
  background: #0f172a;
  color: #a5f3fc;
  padding: 12px;
  border-radius: 8px;
}
</style>
