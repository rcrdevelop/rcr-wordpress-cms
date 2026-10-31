<template>
  <q-page class="bg-grey-1 q-pa-md">
    <div class="text-h5 text-bold q-mb-md">
      <q-icon name="dashboard" class="q-mr-sm" />Gestor de contenidos
    </div>

    <q-tabs v-model="tab" dense active-color="primary" class="q-mb-md">
      <q-tab name="posts" label="Artículos del blog" icon="article" no-caps />
      <q-tab name="pages" label="Páginas" icon="web" no-caps />
    </q-tabs>

    <!-- POSTS -->
    <div v-if="tab === 'posts'">
      <div class="row q-mb-sm">
        <q-space />
        <q-btn
          color="primary"
          icon="add"
          label="Nuevo artículo"
          no-caps
          @click="newPost"
        />
      </div>
      <q-list bordered separator class="bg-white rounded-borders">
        <q-item v-for="p in store.posts" :key="p.id">
          <q-item-section avatar
            ><img :src="coverImage(p.coverHue, p.title)" class="row-thumb"
          /></q-item-section>
          <q-item-section>
            <q-item-label>{{ p.title }}</q-item-label>
            <q-item-label caption
              >{{ p.category }} ·
              {{
                new Date(p.publishedAt).toLocaleDateString("es-ES")
              }}</q-item-label
            >
          </q-item-section>
          <q-item-section side>
            <div class="row">
              <q-btn dense flat icon="edit" @click="editPost(p)" />
              <q-btn
                dense
                flat
                icon="delete"
                color="negative"
                @click="store.removePost(p.id)"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- PAGES -->
    <div v-else>
      <q-list bordered separator class="bg-white rounded-borders">
        <q-item v-for="p in store.pages" :key="p.id">
          <q-item-section avatar
            ><q-icon name="web" color="primary"
          /></q-item-section>
          <q-item-section>
            <q-item-label>{{ p.title }}</q-item-label>
            <q-item-label caption
              >/{{ p.slug }} · {{ p.blocks.length }} bloques</q-item-label
            >
          </q-item-section>
          <q-item-section side>
            <q-btn dense flat icon="edit" @click="editPage(p)" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Editor de post -->
    <q-dialog v-model="postDlg" persistent maximized-mobile>
      <q-card style="max-width: 720px; width: 100%">
        <q-card-section class="row items-center">
          <div class="text-h6"
            >{{
              postForm.id.startsWith("post-") &&
              store.posts.some(x => x.id === postForm.id)
                ? "Editar"
                : "Nuevo"
            }}
            artículo</div
          >
          <q-space />
          <q-btn flat round dense icon="close" @click="postDlg = false" />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            v-model="postForm.title"
            label="Título"
            filled
            dense
            class="q-mb-sm"
          />
          <div class="row q-col-gutter-sm q-mb-sm">
            <q-input
              v-model="postForm.category"
              label="Categoría"
              filled
              dense
              class="col-6"
            />
            <q-input
              v-model="postForm.excerpt"
              label="Extracto"
              filled
              dense
              class="col-6"
            />
          </div>
          <div class="text-caption text-grey-7 q-mb-xs">Contenido</div>
          <q-editor
            v-model="postForm.contentHtml"
            min-height="200px"
            :toolbar="[
              ['bold', 'italic', 'underline'],
              ['h1', 'h2', 'h3'],
              ['unordered', 'ordered'],
              ['undo', 'redo']
            ]"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="postDlg = false" />
          <q-btn
            color="primary"
            label="Publicar"
            :disable="!postForm.title"
            @click="savePost"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Editor de página -->
    <q-dialog v-model="pageDlg" persistent>
      <q-card style="max-width: 640px; width: 100%">
        <q-card-section class="row items-center">
          <div class="text-h6">Editar página: {{ pageForm.title }}</div>
          <q-space />
          <q-btn flat round dense icon="close" @click="pageDlg = false" />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div v-for="(b, i) in pageForm.blocks" :key="i" class="q-mb-sm">
            <div class="row q-col-gutter-sm">
              <q-input
                v-model="b.heading"
                label="Encabezado"
                filled
                dense
                class="col-10"
              />
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                class="col-2"
                @click="pageForm.blocks.splice(i, 1)"
              />
              <q-input
                v-model="b.text"
                label="Texto"
                type="textarea"
                rows="2"
                filled
                dense
                class="col-12"
              />
            </div>
          </div>
          <q-btn
            flat
            dense
            icon="add"
            label="Añadir bloque"
            no-caps
            @click="pageForm.blocks.push({ heading: '', text: '' })"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="pageDlg = false" />
          <q-btn color="primary" label="Guardar" @click="savePage" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useCmsStore } from "@/stores/cms";
import { coverImage, type Page, type Post } from "@/lib/cms";

const store = useCmsStore();
const tab = ref("posts");
const postDlg = ref(false);
const pageDlg = ref(false);

const blankPost = (): Post => ({
  id: `post-${Date.now().toString(36)}`,
  title: "",
  slug: "",
  excerpt: "",
  contentHtml: "<p></p>",
  category: "General",
  coverHue: Math.floor(Math.random() * 360),
  publishedAt: new Date().toISOString()
});
const postForm = reactive<Post>(blankPost());
const pageForm = reactive<Page>({
  id: "",
  title: "",
  slug: "",
  blocks: [],
  seoMeta: { title: "", description: "" },
  updatedAt: ""
});

function newPost() {
  Object.assign(postForm, blankPost());
  postDlg.value = true;
}
function editPost(p: Post) {
  Object.assign(postForm, structuredClone(p));
  postDlg.value = true;
}
function savePost() {
  postForm.slug = postForm.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  store.savePost(structuredClone(postForm));
  postDlg.value = false;
}
function editPage(p: Page) {
  Object.assign(pageForm, structuredClone(p));
  pageDlg.value = true;
}
function savePage() {
  pageForm.updatedAt = new Date().toISOString();
  store.savePage(structuredClone(pageForm));
  pageDlg.value = false;
}
</script>

<style scoped>
.row-thumb {
  width: 90px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}
</style>
