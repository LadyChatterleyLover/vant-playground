<template>
  <div
    v-if="isLoading"
    class="flex items-center justify-center w-full h-screen"
  >
    <van-loading
      color="#1989fa"
    >
      loading...
    </van-loading>
  </div>

  <div class="flex flex-col h-screen">
    <NavHeader :store="store" />
    <Repl
      class="grow"
      auto-resize
      show-compile-output
      :store="store"
      :clear-console="false"
    />
  </div>
</template>

<script lang="ts" setup>
import { ReplStore } from '@/repl-store'
import { Repl } from '@vue/repl'
import NavHeader from './components/NavHeader.vue'

const isLoading = ref(true)

const store = new ReplStore({
  serializedState: location.hash.slice(1),
})

store.init().then(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 300)
})

watchEffect(() => history.replaceState({}, '', store.serialize()))
</script>


