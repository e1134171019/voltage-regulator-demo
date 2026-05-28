<template>
  <Scene03InteractiveBreadboard v-bind="$attrs" />
</template>

<script setup>
import Scene03InteractiveBreadboard from './Scene03InteractiveBreadboard.vue'

const STORAGE_KEY = 'slide03-runtime-state-v2'

const vrefRuntimeState = {
  partPlacements: {
    'zener-1': {
      templateId: 'zener',
      holes: {
        connector0: '10S',
        connector1: '10M',
      },
      freePosition: null,
      rotation: 270,
    },
    'ua741-9': {
      templateId: 'ua741',
      holes: {
        connector0: '21L',
        connector1: '23L',
        connector2: '25L',
        connector3: '27L',
        connector4: '27H',
        connector5: '25H',
        connector6: '23H',
        connector7: '21H',
      },
      freePosition: null,
      rotation: 0,
    },
    'rb-10': {
      templateId: 'rb',
      holes: {
        connector0: '10K',
        connector1: '10H',
      },
      freePosition: null,
      rotation: 270,
    },
    'npn-11': {
      templateId: 'npn',
      holes: {
        connector0: '40G',
        connector1: '42G',
        connector2: '44G',
      },
      freePosition: null,
      rotation: 0,
    },
    'r2-13': {
      templateId: 'r2',
      holes: {
        connector0: '32R',
        connector1: '32O',
      },
      freePosition: null,
      rotation: 270,
    },
    'supply-14': {
      templateId: 'supply',
      holes: {},
      freePosition: {
        x: -98.6158109213909,
        y: 244.17395485061576,
      },
      rotation: 270,
    },
    'supply-15': {
      templateId: 'supply',
      holes: {},
      freePosition: {
        x: 416.4088592036236,
        y: 309.51232590519754,
      },
      rotation: 180,
    },
    'meter-16': {
      templateId: 'meter',
      holes: {},
      freePosition: {
        x: 624.1343590462875,
        y: 267.71337485186996,
      },
      rotation: 270,
    },
    'rb-17': {
      templateId: 'rb',
      holes: {
        connector0: '40P',
        connector1: '40M',
      },
      freePosition: null,
      rotation: 270,
    },
  },
  pendingTemplateRotations: {
    ua741: 0,
    npn: 0,
    supply: 0,
    meter: 0,
    zener: 0,
    rz: 0,
    rb: 0,
    r1: 0,
    r2: 0,
  },
  wires: [
    {
      id: 'user-22',
      from: '10topRed',
      to: '10H',
      fromPartPin: null,
      toPartPin: null,
      color: '#2563eb',
      width: 3.1,
      via: null,
    },
    {
      id: 'user-23',
      from: '10T',
      to: '10bottomBlue',
      fromPartPin: null,
      toPartPin: null,
      color: '#2563eb',
      width: 3.1,
      via: null,
    },
    {
      id: 'user-41',
      from: '1topRed',
      to: '',
      fromPartPin: null,
      toPartPin: {
        partId: 'supply-14',
        pinId: 'connector1',
      },
      color: '#2563eb',
      width: 3.1,
      via: null,
    },
    {
      id: 'user-42',
      from: '1bottomBlue',
      to: '',
      fromPartPin: null,
      toPartPin: {
        partId: 'supply-14',
        pinId: 'connector0',
      },
      color: '#2563eb',
      width: 3.1,
      via: null,
    },
    {
      id: 'user-43',
      from: '1bottomBlue',
      to: '',
      fromPartPin: null,
      toPartPin: {
        partId: 'supply-15',
        pinId: 'connector1',
      },
      color: '#2563eb',
      width: 3.1,
      via: null,
    },
    {
      id: 'user-44',
      from: '',
      to: '63topBlue',
      fromPartPin: {
        partId: 'supply-15',
        pinId: 'connector0',
      },
      toPartPin: null,
      color: '#2563eb',
      width: 3.1,
      via: null,
    },
    {
      id: 'user-49',
      from: '62bottomBlue',
      to: '',
      fromPartPin: null,
      toPartPin: {
        partId: 'meter-16',
        pinId: 'connector0',
      },
      color: '#2563eb',
      width: 3.1,
      via: null,
    },
    {
      id: 'user-53',
      from: '10M',
      to: '',
      fromPartPin: null,
      toPartPin: {
        partId: 'meter-16',
        pinId: 'connector1',
      },
      color: '#2563eb',
      width: 3.1,
      via: {
        x: 545.5856976491193,
        y: 53.49522586419786,
      },
    },
  ],
  nextWireId: 54,
  nextPartInstanceId: 18,
  vin: 12,
  loadCurrent: 0.28,
  meterReadMode: 'voltage',
}

if (typeof window !== 'undefined') {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(vrefRuntimeState))
}
</script>
