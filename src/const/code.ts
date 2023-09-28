
export const setupVant = 'vant.js'

export const vantCode = `
import { getCurrentInstance } from 'vue'
import Vant from 'vant'

const loadCss = () => {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = '#VANT_CSS_HREF#'
  document.body.appendChild(link)
}

export const setupVant = () => {
  const instance = getCurrentInstance()
  instance.appContext.app.use(Vant)
  loadCss()
}`

export const defaultFile = 'App.vue'
export const vantFile = 'vant.js'

export const defaultCode = `<template>
  <h1>
    Hello, Vant
  </h1>
  <van-space :size="24">
    <van-button type="primary">主要按钮</van-button>
    <van-button type="success">成功按钮</van-button>
    <van-button type="default">默认按钮</van-button>
    <van-button type="warning">警告按钮</van-button>
    <van-button type="danger">危险按钮</van-button>
  </van-space>
</template>

<script setup>
import { setupVant } from './vant.js'

setupVant()
</script>`
