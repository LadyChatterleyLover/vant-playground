
import { fetchVersions } from '@/api'
import { compare } from 'compare-versions'

export const genLink = (pkg: string, version?: string, file = '') => {
  const ver = version ? `@${version}` : ''
  return `https://unpkg.com/${pkg}${ver}${file}`
}

export const getVueVersions = () => {
  const versions = fetchVersions('vue')
  return computed(() => versions.value?.filter(ver => compare(ver, '3.2.34', '>=')))
}

export const getVantVersions = () => {
  const versions = fetchVersions('vant')
  return computed(() => versions.value?.filter(ver => compare(ver, '4.7.0', '<=')))
}
