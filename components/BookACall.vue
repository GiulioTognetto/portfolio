<template>
  <UButton
    v-sound
    color="primary"
    variant="solid"
    size="xl"
    icon="i-lucide-calendar"
    class="rounded-xl active:scale-95 transition-all cursor-pointer"
    @click="openCalModal"
  >
    Prenota una Call
  </UButton>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const colorMode = useColorMode()
const calBrandColor = ref('');

onMounted(() => {
  loadCalSdk()
  calBrandColor.value = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-primary-500')
    .trim();
});

const loadCalSdk = () => {
  if (typeof window === 'undefined') return
  if ((window as any).Cal) return

  (function (C: any, A: string, L: string) {
    let p = function (a: any, ar: any) { a.q.push(ar); };
    let d = C.document;
    C.Cal = C.Cal || function () {
      let cal = C.Cal;
      let ar = arguments;
      if (!cal.loaded) {
        cal.ns = {};
        cal.q = cal.q || [];

        const script = d.createElement("script");
        script.src = A;
        script.crossOrigin = "anonymous"; // Aggiunge l'attributo crossorigin="anonymous"
        d.head.appendChild(script);

        cal.loaded = true;
      }
      if (ar[0] === L) {
        const api: any = function () { p(api, arguments); };
        const namespace = ar[1];
        api.q = api.q || [];
        if (typeof namespace === "string") {
          cal.ns[namespace] = cal.ns[namespace] || api;
          p(cal.ns[namespace], ar);
          p(cal, ["initNamespace", namespace]);
        } else p(cal, ar);
        return;
      }
      p(cal, ar);
    };
  })(window, "https://app.cal.com/embed/embed.js", "init");
}

const openCalModal = () => {
  const cal = (window as any).Cal
  if (!cal) return

  const theme = colorMode.value === 'dark' ? 'dark' : 'light'

  // Generiamo un namespace univoco per ogni apertura basandoci sul tema corrente e il timestamp.
  // Questo impedisce a Cal.com di riutilizzare il vecchio iframe con lo sfondo errato.
  const nsName = `discovery-call-${theme}`

  // Inizializziamo il namespace fresco
  cal("init", nsName, { origin: "https://app.cal.com" })

  // Applichiamo gli stili di trasparenza al nuovo namespace
  cal.ns[nsName]("ui", {
    hideEventTypeDetails: false,
    layout: "month_view",
    theme: theme,
    cssVarsPerTheme: {
      dark: {
        "cal-brand" : calBrandColor.value,
        "--cal-bg": "transparent",
        "--cal-bg-emphasis": "transparent",
        "--cal-bg-muted": "transparent",
        "--cal-bg-subtle": "transparent"
      },
      light: {
        "cal-brand" : calBrandColor.value,
        "--cal-bg": "transparent",
        "--cal-bg-emphasis": "transparent",
        "--cal-bg-muted": "transparent",
        "--cal-bg-subtle": "transparent"
      }
    }
  })

  cal.ns[nsName]("modal", {
    calLink: "giuliotognetto/discovery-call",
    config: {
      layout: "month_view",
      useSlotsViewOnSmallScreen: "true",
      theme: theme
    }
  })
}
</script>