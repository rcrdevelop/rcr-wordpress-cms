<template>
  <q-page>
    <!-- HERO -->
    <section
      class="hero q-pa-xl"
      :class="[
        `hero-${store.theme.heroLayout}`,
        { 'text-center': store.theme.heroLayout === 'centrado' }
      ]"
    >
      <div class="hero-inner">
        <div class="text-overline text-white-70">CONSULTORÍA CORPORATIVA</div>
        <h1 class="text-h2 text-bold text-white q-my-sm">
          {{ home?.blocks[0]?.heading ?? "Transformamos empresas" }}
        </h1>
        <p class="text-h6 text-white-85 text-weight-regular hero-sub">
          {{ home?.blocks[0]?.text ?? "" }}
        </p>
        <div
          class="q-mt-lg"
          :class="{ 'text-center': store.theme.heroLayout === 'centrado' }"
        >
          <q-btn
            color="white"
            :text-color="brandText"
            unelevated
            size="lg"
            no-caps
            label="Agenda una llamada"
            icon="calendar_month"
            @click="scrollTo('contacto')"
          />
          <q-btn
            flat
            color="white"
            size="lg"
            no-caps
            label="Ver servicios"
            class="q-ml-sm"
            @click="scrollTo('servicios')"
          />
        </div>
      </div>
    </section>

    <!-- SERVICIOS -->
    <section id="servicios" class="q-pa-xl bg-white">
      <div class="text-h4 text-bold text-center q-mb-lg">Servicios</div>
      <div class="row q-col-gutter-md justify-center">
        <div v-for="s in services" :key="s.title" class="col-12 col-sm-4">
          <q-card flat bordered class="q-pa-md service-card full-height">
            <q-icon
              :name="s.icon"
              size="36px"
              :style="{ color: store.theme.primaryColor }"
            />
            <div class="text-h6 q-mt-sm">{{ s.title }}</div>
            <p class="text-body2 text-grey-8 q-mt-xs">{{ s.text }}</p>
          </q-card>
        </div>
      </div>
    </section>

    <!-- CASOS -->
    <section id="casos" class="q-pa-xl bg-grey-1">
      <div class="text-h4 text-bold text-center q-mb-lg">Casos de éxito</div>
      <div class="row q-col-gutter-md justify-center">
        <div v-for="c in cases" :key="c.company" class="col-12 col-sm-4">
          <q-card flat bordered class="q-pa-md full-height">
            <div
              class="text-h3 text-bold"
              :style="{ color: store.theme.primaryColor }"
              >{{ c.kpi }}</div
            >
            <div class="text-subtitle1 text-bold q-mt-xs">{{ c.company }}</div>
            <p class="text-body2 text-grey-8 q-mt-xs">{{ c.text }}</p>
          </q-card>
        </div>
      </div>
    </section>

    <!-- EQUIPO -->
    <section class="q-pa-xl bg-white">
      <div class="text-h4 text-bold text-center q-mb-lg">Equipo directivo</div>
      <div class="row q-col-gutter-md justify-center">
        <div v-for="m in team" :key="m.name" class="col-6 col-sm-3 text-center">
          <q-avatar
            size="90px"
            :style="{ background: m.color }"
            class="text-white text-h5 text-bold"
          >
            {{ m.initials }}
          </q-avatar>
          <div class="text-subtitle1 text-bold q-mt-sm">{{ m.name }}</div>
          <div class="text-caption text-grey-7">{{ m.role }}</div>
        </div>
      </div>
    </section>

    <!-- BLOG -->
    <section id="blog" class="q-pa-xl bg-grey-1">
      <div class="text-h4 text-bold text-center q-mb-lg">Blog</div>
      <div class="row q-col-gutter-md justify-center">
        <div v-for="p in store.posts" :key="p.id" class="col-12 col-sm-4">
          <q-card
            flat
            bordered
            class="post-card cursor-pointer"
            @click="openPost(p)"
          >
            <img :src="coverImage(p.coverHue, p.title)" class="post-img" />
            <q-card-section>
              <q-badge
                :style="{ background: store.theme.primaryColor }"
                :label="p.category"
                class="text-white"
              />
              <div class="text-subtitle1 text-bold q-mt-xs">{{ p.title }}</div>
              <p class="text-caption text-grey-7 q-mt-xs">{{ p.excerpt }}</p>
              <div class="text-caption text-grey-6">{{
                new Date(p.publishedAt).toLocaleDateString("es-ES")
              }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </section>

    <!-- CONTACTO -->
    <section id="contacto" class="q-pa-xl bg-white">
      <div class="text-h4 text-bold text-center q-mb-lg">Contacto</div>
      <q-card flat bordered class="q-pa-md mx-auto" style="max-width: 560px">
        <div v-if="!sent" class="row q-col-gutter-sm">
          <q-input
            v-model="form.name"
            label="Nombre"
            filled
            dense
            class="col-12"
          />
          <q-input
            v-model="form.email"
            label="Email corporativo"
            filled
            dense
            class="col-12"
          />
          <q-input
            v-model="form.msg"
            label="¿En qué podemos ayudarte?"
            type="textarea"
            rows="3"
            filled
            dense
            class="col-12"
          />
          <q-btn
            color="primary"
            unelevated
            class="col-12"
            label="Enviar mensaje"
            no-caps
            :style="{ background: store.theme.primaryColor }"
            @click="send"
          />
        </div>
        <div v-else class="text-center q-pa-lg">
          <q-icon name="mark_email_read" size="52px" color="positive" />
          <div class="text-h6 q-mt-sm">Mensaje enviado</div>
          <div class="text-caption text-grey-7"
            >Te responderemos en menos de 24h laborables.</div
          >
        </div>
      </q-card>
    </section>

    <footer class="q-pa-lg text-center text-caption text-white site-footer">
      © 2026 {{ store.theme.brandName }} · Sitio corporativo headless sobre
      Firebase · demo
    </footer>

    <!-- Lector de posts -->
    <q-dialog v-model="postOpen" maximized-mobile>
      <q-card v-if="post" style="max-width: 720px; width: 100%">
        <img
          :src="coverImage(post.coverHue, post.title)"
          style="width: 100%; max-height: 220px; object-fit: cover"
        />
        <q-card-section>
          <q-btn
            flat
            round
            dense
            icon="close"
            class="float-right"
            @click="postOpen = false"
          />
          <q-badge
            :style="{ background: store.theme.primaryColor }"
            :label="post.category"
            class="text-white"
          />
          <div class="text-h4 text-bold q-mt-sm">{{ post.title }}</div>
          <div class="text-caption text-grey-6 q-mb-md">{{
            new Date(post.publishedAt).toLocaleDateString("es-ES")
          }}</div>
          <div class="post-body" v-html="post.contentHtml" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useCmsStore } from "@/stores/cms";
import { coverImage, type Post } from "@/lib/cms";

const store = useCmsStore();
const home = computed(() => store.pages.find(p => p.slug === "inicio"));
const post = ref<Post | null>(null);
const postOpen = ref(false);
const sent = ref(false);
const form = ref({ name: "", email: "", msg: "" });

const brandText = computed(() =>
  ["#f59e0b", "#fde047", "#f8fafc"].includes(store.theme.primaryColor)
    ? "black"
    : "primary"
);

const services = computed(() => {
  const blocks = store.pages.find(p => p.slug === "servicios")?.blocks ?? [];
  const icons = ["trending_up", "memory", "precision_manufacturing"];
  return blocks.map((b, i) => ({
    title: b.heading,
    text: b.text,
    icon: icons[i % 3]
  }));
});

const cases = [
  {
    company: "Logística Andina S.A.",
    kpi: "+38%",
    text: "Reducción de costes de última milla tras rediseñar su red de distribución."
  },
  {
    company: "Grupo Finex",
    kpi: "6 semanas",
    text: "Migración completa a cloud sin downtime y con ahorro del 22% en infraestructura."
  },
  {
    company: "Retail Nortemx",
    kpi: "×2.4",
    text: "Duplicaron conversión ecommerce con la nueva plataforma headless."
  }
];

const team = [
  {
    name: "Ricardo Contreras",
    role: "Managing Partner",
    initials: "RC",
    color: "#1d4ed8"
  },
  {
    name: "Lucía Ferrán",
    role: "Directora de Estrategia",
    initials: "LF",
    color: "#0f766e"
  },
  { name: "Marco Ibáñez", role: "CTO", initials: "MI", color: "#7c3aed" },
  {
    name: "Elena Duarte",
    role: "Head of Operations",
    initials: "ED",
    color: "#b45309"
  }
];

function openPost(p: Post) {
  post.value = p;
  postOpen.value = true;
}
function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}
function send() {
  if (form.value.name && form.value.email) sent.value = true;
}
</script>

<style scoped>
.hero {
  background: linear-gradient(120deg, var(--brand, #1d4ed8), #0f172a 160%);
  min-height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero-izquierda {
  justify-content: flex-start;
}
.hero-inner {
  max-width: 780px;
}
.hero-sub {
  max-width: 560px;
}
.hero-centrado .hero-sub {
  margin: 0 auto;
}
.text-white-70 {
  color: rgba(255, 255, 255, 0.7);
}
.text-white-85 {
  color: rgba(255, 255, 255, 0.85);
}
.service-card {
  border-radius: 14px;
}
.post-card {
  border-radius: 12px;
  overflow: hidden;
}
.post-img {
  width: 100%;
  height: 140px;
  object-fit: cover;
}
.post-body :deep(h3) {
  font-size: 1.2rem;
  margin: 1rem 0 0.4rem;
}
.site-footer {
  background: #1d2327;
}
</style>
