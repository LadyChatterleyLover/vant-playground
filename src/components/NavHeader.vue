<template>
  <div class="flex justify-between p-2">
    <h1 class="texvan-base">
      Vant Playground
    </h1>
    <div
      class="flex items-center"
    >
      <div
        v-for="item of selectors"
        :key="item.name"
        class="flex items-center"
      >
        <span class="mr-2">{{ item.name }}:</span>
        <select
          v-model="item.activeVer"
          class="min-w-32 mr-5"
          @change="onVerChange(item.name, item.activeVer)"
        >
          <option
            v-for="v in item.vers"
            :key="v"
            :label="v"
            :value="v"
          />
        </select>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getVantVersions, getVueVersions } from '@/utils'
import type { ReplStore } from '@/repl-store'
import type { VersionKey } from '@/types'

const props = defineProps<{
  store: ReplStore
}>()

const selectors = reactive({
  Vue: {
    name: 'Vue',
    vers: getVueVersions(),
    activeVer: props.store.versions.Vue,
  },
  Vant: {
    name: 'Vant',
    vers: getVantVersions(),
    activeVer: props.store.versions.Vant,
  },
})

const onVerChange = async (name: string, ver: unknown) => {
  await props.store.setVersion(name as VersionKey, ver as string)
}
</script>
